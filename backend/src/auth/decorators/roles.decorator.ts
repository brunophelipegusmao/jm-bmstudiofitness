import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../database/schema';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
