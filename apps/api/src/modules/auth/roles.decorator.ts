import { SetMetadata } from '@nestjs/common';

export const rolesKey = 'clinic:roles';
export const Roles = (...roles: Array<'owner' | 'staff'>) => SetMetadata(rolesKey, roles);
