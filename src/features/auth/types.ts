import type { components } from '../../api/schema';

/** Corpul cererii `POST /auth/login` (schema `LoginRequest`). */
export type LoginRequest = components['schemas']['LoginRequest'];

/** Răspunsul la login: tokenurile sau o provocare 2FA (schema `LoginResponse`). */
export type LoginResponse = components['schemas']['LoginResponse'];

/** Utilizatorul autentificat, cu rolurile sale (schema `Utilizator`, din `GET /auth/me`). */
export type CurrentUser = components['schemas']['Utilizator'];

/** Un rol: Student, CoordonatorGrant, ResponsabilLaborator sau AdministratorSistem. */
export type Role = components['schemas']['Rol'];
