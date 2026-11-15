import '@testing-library/jest-dom/vitest';
import { TOKEN_STORAGE_KEY } from '../api/client';
import { getCurrentUser } from '../features/auth/api';
import { TEST_TOKEN, TEST_USER } from './authenticatedUser';

// Apelurile de autentificare nu ajung la backend în teste. Implicit, fiecare test rulează cu un
// utilizator autentificat (TEST_USER), ca paginile protejate să se poată randa direct. Testele
// pentru login / neautentificat golesc sessionStorage și își configurează singure mock-urile.
vi.mock('../features/auth/api');

beforeEach(() => {
  // Fiecare test pornește fără apelurile înregistrate în testele anterioare.
  vi.clearAllMocks();
  sessionStorage.setItem(TOKEN_STORAGE_KEY, TEST_TOKEN);
  vi.mocked(getCurrentUser).mockResolvedValue(TEST_USER);
});

afterEach(() => {
  sessionStorage.clear();
});
