import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError } from 'graphql';
import { JSONResolver } from 'graphql-scalars';

import _ from 'lodash';

import {
  user_email_is_super_user_rule,
  user_email_can_own_collections_rule,
  user_email_allowed_rule,
  check_authz_rules,
} from 'src/authz.ts';

import { app_error_to_gql_error } from 'src/error_utils.ts';

import {
  UserByEmailLoader,
  UserByIdLoader,
  get_or_create_users,
} from 'src/schema/core/User/UserModel.ts';
import type { UserDocument } from 'src/schema/core/User/UserModel.ts';
import type { LangsUnion } from 'src/schema/lang_utils.ts';
import {
  resolver_with_authz,
  resolve_document_id,
  resolve_lang_suffixed_scalar,
} from 'src/schema/resolver_utils.ts';

import {
  CollectionModel,
  CurrentCollectionsByOwnersLoader,
  CurrentCollectionsByUploadersLoader,
  AllCollectionVersionsByStableKeyLoader,
  create_collection,
  update_collection_def_fields,
  are_new_column_defs_compatible_with_current_records,
  update_collection_column_defs,
  validate_record_data_against_column_defs,
  insert_records,
  delete_records,
  RecordsByRecordsetKeyLoader,
  make_records_created_by_user_loader_with_recordset_constraint,
  CollectionByIdLoader,
  RecordByIdLoader,
} from './CollectionModel.ts';
import type {
  CollectionDocument,
  CollectionDefInterface,
  RecordInterface,
  RecordDocument,
} from './CollectionModel.ts';

const make_collection_def_scalar_resolver =
  <Key extends keyof CollectionDocument['collection_def']>(key: Key) =>
  (
    parent: CollectionDocument,
    _args: unknown,
    _context: unknown,
    _info: unknown,
  ) =>
    parent.collection_def[key];

type CollectionLevelAuthzRule = (
  user: Express.User,
  collection?: CollectionDocument,
  records?: RecordInterface[],
) => boolean;

const user_can_be_collection_owner: CollectionLevelAuthzRule = (user) =>
  check_authz_rules(user, user_email_is_super_user_rule) ||
  check_authz_rules(user, user_email_can_own_collections_rule);

const user_can_be_collection_uploader: CollectionLevelAuthzRule = (user) =>
  check_authz_rules(user, user_email_allowed_rule);

const user_is_owner_of_collection: CollectionLevelAuthzRule = (
  user,
  collection,
) =>
  typeof collection !== 'undefined' &&
  user_can_be_collection_owner(user) &&
  (check_authz_rules(user, user_email_is_super_user_rule) ||
    _.chain(collection.collection_def.owners)
      .map(_.toString)
      .includes(user.mongoose_doc!._id.toString())
      .value());

const user_is_uploader_for_collection: CollectionLevelAuthzRule = (
  user,
  collection,
) =>
  typeof collection !== 'undefined' &&
  _.chain(collection.collection_def.uploaders)
    .map(_.toString)
    .includes(user.mongoose_doc!._id.toString())
    .value() &&
  user_can_be_collection_uploader(user);

const user_can_view_collection: CollectionLevelAuthzRule = (user, collection) =>
  typeof collection !== 'undefined' &&
  (user_is_owner_of_collection(user, collection) ||
    (!collection.collection_def.is_locked &&
      user_is_uploader_for_collection(user, collection)));

const user_can_upload_to_collection: CollectionLevelAuthzRule = (
  user,
  collection,
) =>
  typeof collection !== 'undefined' &&
  collection.is_current_version &&
  user_can_view_collection(user, collection);

const user_can_edit_collection: CollectionLevelAuthzRule = (user, collection) =>
  typeof collection !== 'undefined' &&
  collection.is_current_version &&
  user_is_owner_of_collection(user, collection);

const user_can_view_records: CollectionLevelAuthzRule = (
  user,
  collection,
  records,
) =>
  typeof collection !== 'undefined' &&
  _.every(
    records,
    ({ recordset_key }) => recordset_key === collection.recordset_key,
  ) &&
  user_can_view_collection(user, collection) &&
  (user_is_owner_of_collection(user, collection) ||
    (!collection.collection_def.is_locked &&
      user_is_uploader_for_collection(user, collection) &&
      _.every(
        records,
        (record) =>
          typeof record !== 'undefined' &&
          record.created_by.toString() === user.mongoose_doc!._id.toString(),
      )));

const user_can_edit_records: CollectionLevelAuthzRule = (
  user,
  collection,
  records,
) =>
  typeof collection !== 'undefined' &&
  collection.is_current_version &&
  user_can_view_records(user, collection, records);

const validate_collection_level_authorization = (
  operation_name: string,
  user: Express.AuthenticatedUser,
  context: { collection?: CollectionDocument; records?: RecordInterface[] },
  ...mutation_rules: CollectionLevelAuthzRule[]
) => {
  if (
    !_.every(mutation_rules, (rule) =>
      rule(user, context.collection, context.records),
    )
  ) {
    throw new GraphQLError(
      `${operation_name} has unmet authorization requirements.`,
      {
        extensions: {
          code: 403,
        },
      },
    );
  }
};

type CollectionDefInput = {
  name_en: string;
  name_fr: string;
  description_en: string;
  description_fr: string;
  is_locked: boolean;
  owner_emails: string[];
  uploader_emails: string[];
};
type ColumnDefInput = {
  header: string;
  name_en: string;
  name_fr: string;
  description_en: string;
  description_fr: string;
  data_type: string;
  conditions: ConditionInput[];
};
type ConditionInput = {
  condition_type: string;
  parameters: string[];
};

const collection_def_input_to_model_fields = async (
  collection_input: CollectionDefInput,
): Promise<CollectionDefInterface> => {
  const { owner_emails, uploader_emails, ...passthrough_fields } =
    collection_input;

  const users = await get_or_create_users([
    ...owner_emails,
    ...uploader_emails,
  ]);

  const user_ids_by_email = _.chain(users)
    .map(({ _id, email }) => [email, _id])
    .fromPairs()
    .value();

  return {
    ...passthrough_fields,
    owners: _.map(owner_emails, (email) => user_ids_by_email[email]),
    uploaders: _.map(uploader_emails, (email) => user_ids_by_email[email]),
  };
};

export const CollectionSchema = makeExecutableSchema({
  typeDefs: `
  type QueryRoot {
    user_owned_collections(email: String!): [Collection]
    user_uploadable_collections(email: String!): [Collection]
    collection(collection_id: String!): Collection
    all_collections: [Collection]
  }

  type User {
    owned_collections: [Collection]
    uploadable_collections: [Collection]
  }
  
  type Collection {
    ### Scalar fields
    id: String!
    stable_key: String!
    major_ver: String!
    minor_ver: String!
    is_current_version: Boolean!
    created_by: User!
    created_at: Float!
    
    ### Subdocument scalar fields
    name_en: String!
    name_fr: String!
    description_en: String!
    description_fr: String!
    is_locked: Boolean!

    ### Lang aware resolver subdocument scalar fields
    name: String!
    description: String!
    
    ### Non-scalar fields
    previous_versions: [Collection]
    
    """
      \`owners\` array will be non-empty
    """
    owners: [User!]! # note: these !'s mean neither the field itself nor elements of the array may be null, but it doesn't enforce that the array is non-empty

    """
      \`uploaders\` array may be empty
    """
    uploaders: [User!]! # note: these !'s mean neither the field itself nor elements of the array may be null, but it doesn't enforce that the array is non-empty

    column_defs: [ColumnDef]
    # the mongoose models have a \`Recordset\` layer between \`Collection\`s and \`ColumnDef\`s/\`Record\`s,
    # but this is just to enable smarter versioning. Can directly expose the \`Recordset\` fields for the GQL API
    record(record_id: String!): Record
    """
      \`uploader_email\` defaults to the email of the current user session
    """
    records_uploaded_by(uploader_email: String): [Record]
    all_records: [Record]
  }

  type ColumnDef {
    ### Scalar fields
    id: String!
    header: String!
    name_en: String!
    name_fr: String!
    description_en: String!
    description_fr: String!
    data_type: String! # TODO will be an enum eventually
    
    ### Lang aware resolver scalar fields
    name: String!
    description: String!

    ### Non-scalar fields

    """
      \`Conditions\` array may be empty
    """
    conditions: [Condition!]!
  }

  type Condition {
    ### Scalar fields
    condition_type: String! # TODO will be an enum eventually

    """
      \`parameters\` array may be empty
    """
    parameters: [String!]!
  }

  type Record {
    ### Scalar fields
    id: String!
    data: JSON # https://the-guild.dev/graphql/scalars/docs/scalars/json
    created_at: Float

    ### Non-scalar fields
    created_by: User
  }

  scalar JSON

  type Mutation {
    create_collection_init(collection_def: CollectionDefInput): Collection
    create_collection_from_base(collection_id: String!): Collection

    # TODO need GQL schema types for collection update validation responses
    update_collection(collection_id: String!, collection_updates: CollectionDefInput): Collection

    # TODO need GQL schema types for collection update validation responses
    validate_new_column_defs(collection_id: String!, column_defs: [ColumnDefInput]): Boolean 
    update_column_defs(collection_id: String!, column_defs: [ColumnDefInput]): Collection

    # TODO need GQL schema types for record validation responses
    validate_new_records(collection_id: String!, records: [JSON]): Boolean
    insert_records(collection_id: String!, records: [JSON]): [Record]
    delete_records(collection_id: String!, record_ids: [String!]!): Int
  }
  input CollectionDefInput {
    name_en: String!
    name_fr: String!
    description_en: String!
    description_fr: String!
    is_locked: Boolean!
    """
      \`owner_emails\` array parameter may be empty. The email of the user creating the collection is implicitly included
    """
    owner_emails: [String!]!
    """
      \`uploader_emails\` array parameter may be empty
    """
    uploader_emails: [String!]!
  }
  input ColumnDefInput {
    header: String!
    name_en: String!
    name_fr: String!
    description_en: String!
    description_fr: String!
    data_type: String!
    """
      \`conditions\` array parameter may be empty
    """
    conditions: [ConditionInput!]!
  }
  input ConditionInput {
    condition_type: String!
    parameters: [String!]!
  }
`,
  resolvers: {
    QueryRoot: {
      user_owned_collections: resolver_with_authz(
        async (
          _parent: unknown,
          { email }: { email: string },
          _context: unknown,
          _info: unknown,
        ) => {
          const user = await UserByEmailLoader.load(email);
          return typeof user === 'undefined'
            ? []
            : CurrentCollectionsByOwnersLoader.load(user._id.toString());
        },
        user_email_is_super_user_rule,
      ),
      user_uploadable_collections: resolver_with_authz(
        async (
          _parent: unknown,
          { email }: { email: string },
          _context: unknown,
          _info: unknown,
        ) => {
          const user = await UserByEmailLoader.load(email);
          return typeof user === 'undefined'
            ? []
            : CurrentCollectionsByUploadersLoader.load(user._id.toString());
        },
        user_email_is_super_user_rule,
      ),
      all_collections: resolver_with_authz(
        () => CollectionModel.find({ is_current_version: true }),
        user_email_is_super_user_rule,
      ),
      collection: resolver_with_authz(
        async (
          _parent: unknown,
          { collection_id }: { collection_id: string },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const collection = await CollectionByIdLoader.load(collection_id);

          validate_collection_level_authorization(
            `Query \`${fieldName}\``,
            context.req.user,
            { collection },
            user_can_view_collection,
          );

          return collection;
        },
      ),
    },
    User: {
      owned_collections: (
        parent: UserDocument,
        _args: unknown,
        _context: unknown,
        _info: unknown,
      ) => {
        if (check_authz_rules(parent, user_email_is_super_user_rule)) {
          return CollectionModel.find({ is_current_version: true });
        } else {
          return CurrentCollectionsByOwnersLoader.load(parent._id.toString());
        }
      },
      uploadable_collections: (
        parent: UserDocument,
        _args: unknown,
        _context: unknown,
        _info: unknown,
      ) => CurrentCollectionsByUploadersLoader.load(parent._id.toString()),
    },
    Collection: {
      id: resolve_document_id,
      ...Object.fromEntries(
        // key array declared `as const` to preserve key string literals for the map function's type checking
        (
          [
            'name_en',
            'name_fr',
            'description_en',
            'description_fr',
            'is_locked',
          ] as const
        ).map((key) => [key, make_collection_def_scalar_resolver(key)]),
      ),
      name: (
        parent: CollectionDocument,
        _args: unknown,
        context: { lang: LangsUnion },
        _info: unknown,
      ) =>
        resolve_lang_suffixed_scalar('name')(
          parent.collection_def,
          _args,
          context,
          _info,
        ),
      description: (
        parent: CollectionDocument,
        _args: unknown,
        context: { lang: LangsUnion },
        _info: unknown,
      ) =>
        resolve_lang_suffixed_scalar('description')(
          parent.collection_def,
          _args,
          context,
          _info,
        ),
      previous_versions: async (
        parent: CollectionDocument,
        _args: unknown,
        _context: unknown,
        _info: unknown,
      ) => {
        const all_collections_by_stable_key =
          await AllCollectionVersionsByStableKeyLoader.load(parent.stable_key);
        return _.filter(
          all_collections_by_stable_key,
          ({ _id }) => _id.toString() !== parent._id.toString(),
        );
      },
      created_by: (
        parent: CollectionDocument,
        _args: unknown,
        _context: unknown,
        _info: unknown,
      ) => UserByIdLoader.load(parent.created_by.toString()),
      owners: (
        parent: CollectionDocument,
        _args: unknown,
        _context: unknown,
        _info: unknown,
      ) =>
        UserByIdLoader.loadMany(
          parent.collection_def.owners.map((object_id) => object_id.toString()),
        ),
      uploaders: (
        parent: CollectionDocument,
        _args: unknown,
        _context: unknown,
        _info: unknown,
      ) =>
        typeof parent.collection_def.uploaders === 'undefined'
          ? []
          : UserByIdLoader.loadMany(
              parent.collection_def.uploaders.map((object_id) =>
                object_id.toString(),
              ),
            ),
      record: resolver_with_authz(
        async (
          parent: CollectionDocument,
          { record_id }: { record_id: string },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const record = await RecordByIdLoader.load(record_id);

          validate_collection_level_authorization(
            `Query \`${fieldName}\``,
            context.req.user,
            {
              collection: parent,
              records: typeof record !== 'undefined' ? [record] : [],
            },
            user_can_view_records,
          );

          return record;
        },
      ),
      records_uploaded_by: resolver_with_authz(
        async (
          parent: CollectionDocument,
          { uploader_email }: { uploader_email?: string },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          validate_collection_level_authorization(
            `Query \`${fieldName}\``,
            context.req.user,
            {
              collection: parent,
            },
            user_can_view_collection,
          );

          const email_to_query =
            typeof uploader_email === 'undefined'
              ? context.req.user.email
              : uploader_email;

          const user = await UserByEmailLoader.load(email_to_query);

          if (typeof user === 'undefined') {
            return [];
          }

          const RecordsetRecordsByUserLoader =
            make_records_created_by_user_loader_with_recordset_constraint(
              parent.recordset_key,
            );

          const records = await RecordsetRecordsByUserLoader.load(
            user._id.toString(),
          );

          validate_collection_level_authorization(
            `Query \`${fieldName}\``,
            context.req.user,
            {
              collection: parent,
              records,
            },
            user_can_view_records,
          );

          return typeof records === 'undefined' ? [] : records;
        },
      ),
      all_records: resolver_with_authz(
        async (
          parent: CollectionDocument,
          _args: unknown,
          context,
          { fieldName }: { fieldName: string },
        ) => {
          validate_collection_level_authorization(
            `Query \`${fieldName}\``,
            context.req.user,
            {
              collection: parent,
            },
            user_is_owner_of_collection,
          );

          const records = await RecordsByRecordsetKeyLoader.load(
            parent.recordset_key,
          );
          return typeof records === 'undefined' ? [] : records;
        },
      ),
    },
    ColumnDef: {
      id: resolve_document_id,
      name: resolve_lang_suffixed_scalar('name'),
      description: resolve_lang_suffixed_scalar('description'),
    },
    Record: {
      id: resolve_document_id,
      created_by: (
        parent: RecordInterface,
        _args: unknown,
        _context: unknown,
        _info: unknown,
      ) => UserByIdLoader.load(parent.created_by.toString()),
    },
    JSON: JSONResolver,
    Mutation: {
      create_collection_init: resolver_with_authz(
        async (
          _parent: unknown,
          { collection_def }: { collection_def: CollectionDefInput },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            {},
            user_can_be_collection_owner,
          );

          try {
            const model_ready_collection_def =
              await collection_def_input_to_model_fields(collection_def);

            return create_collection(
              context.req.user.mongoose_doc,
              model_ready_collection_def,
              [],
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),
      create_collection_from_base: resolver_with_authz(
        async (
          _parent: unknown,
          { collection_id }: { collection_id: string },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const base_collection =
            await CollectionByIdLoader.load(collection_id);

          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            { collection: base_collection },
            user_can_be_collection_owner,
            user_can_edit_collection,
          );

          try {
            return create_collection(
              context.req.user.mongoose_doc,
              base_collection!.collection_def,
              base_collection!.column_defs,
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),

      update_collection: resolver_with_authz(
        async (
          _parent: unknown,
          {
            collection_id,
            collection_updates,
          }: {
            collection_id: string;
            collection_updates: CollectionDefInput;
          },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const collection = await CollectionByIdLoader.load(collection_id);

          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            { collection },
            user_can_edit_collection,
          );

          try {
            const model_ready_collection_def =
              await collection_def_input_to_model_fields(collection_updates);

            return update_collection_def_fields(
              collection!,
              context.req.user.mongoose_doc,
              model_ready_collection_def,
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),

      validate_new_column_defs: resolver_with_authz(
        async (
          _parent: unknown,
          {
            collection_id,
            column_defs,
          }: {
            collection_id: string;
            column_defs: ColumnDefInput[];
          },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const collection = await CollectionByIdLoader.load(collection_id);

          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            { collection },
            user_can_edit_collection,
          );

          try {
            return are_new_column_defs_compatible_with_current_records(
              collection!,
              column_defs,
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),
      update_column_defs: resolver_with_authz(
        async (
          _parent: unknown,
          {
            collection_id,
            column_defs,
          }: {
            collection_id: string;
            column_defs: ColumnDefInput[];
          },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const collection = await CollectionByIdLoader.load(collection_id);

          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            { collection },
            user_can_edit_collection,
          );
          try {
            return update_collection_column_defs(
              collection!,
              context.req.user.mongoose_doc,
              column_defs,
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),

      validate_new_records: resolver_with_authz(
        async (
          _parent: unknown,
          {
            collection_id,
            records,
          }: { collection_id: string; records: JSON[] },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const collection = await CollectionByIdLoader.load(collection_id);

          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            { collection },
            user_can_upload_to_collection,
          );

          try {
            return validate_record_data_against_column_defs(
              collection!.column_defs,
              records,
              true,
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),
      insert_records: resolver_with_authz(
        async (
          _parent: unknown,
          {
            collection_id,
            records,
          }: { collection_id: string; records: JSON[] },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const collection = await CollectionByIdLoader.load(collection_id);

          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            { collection },
            user_can_upload_to_collection,
          );

          try {
            return insert_records(
              collection!,
              records,
              context.req.user.mongoose_doc,
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),
      delete_records: resolver_with_authz(
        async (
          _parent: unknown,
          {
            collection_id,
            record_ids,
          }: { collection_id: string; record_ids: string[] },
          context,
          { fieldName }: { fieldName: string },
        ) => {
          const collection = await CollectionByIdLoader.load(collection_id);
          const requested_records = await RecordByIdLoader.loadMany(record_ids);

          const valid_requested_records = requested_records.filter(
            (record, index): record is RecordDocument =>
              typeof record !== 'undefined' &&
              '_id' in record &&
              record._id.toString() === record_ids[index],
          );

          validate_collection_level_authorization(
            `Action \`${fieldName}\``,
            context.req.user,
            { collection, records: valid_requested_records },
            user_can_edit_records,
          );

          try {
            const delete_result = await delete_records(
              valid_requested_records.map((record) => record._id),
            );
            return delete_result.deletedCount;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            throw app_error_to_gql_error(error);
          }
        },
      ),
    },
  },
});
