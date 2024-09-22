import { gql } from '@apollo/client';

export const UPDATE_COLLECTION = gql`
  mutation CollectionUpdate(
    $collection_id: String!
    $collection_updates: CollectionDefInput!
  ) {
    update_collection(
      collection_id: $collection_id
      collection_updates: $collection_updates
    ) {
      id
    }
  }
`;
