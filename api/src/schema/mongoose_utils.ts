import { Schema } from 'mongoose';

import { get_lang_suffixed_keys } from './lang_utils.ts';
import type { LangSuffixedKeyUnion } from './lang_utils.ts';

export const primary_key_type = {
  type: String,
  unique: true,
  required: true,
  index: true,
};
// This probably shouldn't be used outside of the case of optional subdocuments, but it IS required for subdocuments whenever
// the subdocument schema needs a primary_key but isn't itself a required field of the parent. If multiple parents ARE
// missing a subdocument which has a required unique index then the database will throw a "dup key: { : null }" error.
// The only solution is to not put unique indexes on the subdocuments or to make sure they're sparse.
export const primary_key_type_sparse = {
  type: String,
  unique: true,
  sparse: true,
};

type ForeignTypeOptions = { required?: boolean; index?: boolean };
const use_foreign_type_options = (
  options?: ForeignTypeOptions,
): { required: true; index: boolean } | { sparse: boolean } =>
  options?.required
    ? { required: true, index: !!options?.index }
    : { sparse: !!options?.index };

export const make_foreign_key_type = <
  KeyType extends typeof String | typeof Number,
>(
  key_type: KeyType,
  _ref: string, // unused, require it to be declared for self-documentation
  options?: ForeignTypeOptions,
) => ({
  type: key_type,
  ...use_foreign_type_options(options),
});

export const make_foreign_id_type = (
  ref: string,
  options?: ForeignTypeOptions,
) => ({
  type: Schema.ObjectId,
  ref,
  ...use_foreign_type_options(options),
});

export const make_lang_suffixed_type = <Key extends string, MongooseType>(
  key: Key,
  type: MongooseType,
) =>
  Object.fromEntries(get_lang_suffixed_keys(key).map((key) => [key, type])) as {
    [k in LangSuffixedKeyUnion<Key>]: MongooseType;
  };
