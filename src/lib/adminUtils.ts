export const ADMIN_EMAILS = [
    'tourist@test.com',
    'guide@test.com',
    'saipranay6733@gmail.com',
    'admin@test.com'
];

/**
 * Checks if a given email belongs to an administrative user.
 */
export const isAdmin = (email: string | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};
