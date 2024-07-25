import { Schema, model } from 'mongoose';
import type { Document } from 'mongoose';

import { AppError } from 'src/error_utils.ts';
import { create_dataloader_for_resource_by_primary_key } from 'src/schema/loader_utils.ts';
import { pkey_type } from 'src/schema/mongoose_utils.ts';

interface UserInterface extends Document {
  email: string;
  created_at: number;
  second_last_login_at?: number;
  last_login_at?: number;
}
const UserMongooseSchema = new Schema<UserInterface>({
  email: pkey_type,
  created_at: { type: Number, required: true },
  second_last_login_at: { type: Number, required: false },
  last_login_at: { type: Number, required: false },
});
export const UserModel = model<UserInterface>('User', UserMongooseSchema);

export const UserByEmailLoader = create_dataloader_for_resource_by_primary_key(
  UserModel,
  'email',
  true,
);

export const get_or_create_user = async (email: string) => {
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    return existingUser;
  } else {
    return UserModel.create({
      email,
      created_at: Date.now(),
    });
  }
};

export const update_user_last_login_times = async (email: string) => {
  const user = await UserModel.findOne({ email });

  if (user === null) {
    throw new AppError(500, `No user found with email "${email}"`);
  } else {
    user.second_last_login_at = user.last_login_at;
    user.last_login_at = Date.now();
    return user.save();
  }
};