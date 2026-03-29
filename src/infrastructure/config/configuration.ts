export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finances',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key',
    expiresIn: '24h',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM || 'onboarding@resend.dev',
  },
});
