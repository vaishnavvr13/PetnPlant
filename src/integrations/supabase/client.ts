// Temporary stub - Supabase client removed
// Images now uploaded to MongoDB via REST API

export const supabase = {
    from: () => ({
        select: () => Promise.reject(new Error('Supabase removed. Use REST API')),
        insert: () => Promise.reject(new Error('Supabase removed. Use REST API')),
        update: () => Promise.reject(new Error('Supabase removed. Use REST API')),
    }),
    auth: {
        getUser: () => Promise.reject(new Error('Use useAuth hook instead')),
    },
    storage: {
        from: () => ({
            upload: async (path, file) => {
                // This is handled by the upload endpoint now
                // Frontend should use: POST /api/upload with FormData
                return {
                    data: null,
                    error: new Error('Use POST /api/upload endpoint instead')
                };
            },
        }),
    },
};
