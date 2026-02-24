"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const Admin = () => (0, common_1.SetMetadata)(exports.ROLES_KEY, [client_1.UserRole.ADMIN]);
exports.Admin = Admin;
//# sourceMappingURL=roles.decorator.js.map