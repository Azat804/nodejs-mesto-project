require('dotenv').config({ path: '.env.deploy' });

const {
  DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REPOSITORY, DEPLOY_REF = 'origin/main',
} = process.env;

module.exports = {
  apps: [{
    name: 'api-service',
    script: './src/app.ts',
  }],

  // Настройка деплоя
  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: DEPLOY_REPOSITORY,
      path: DEPLOY_PATH,
      'pre-deploy': `scp  ./env* ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}`,
      'post-deploy': 'npm i',
    },
  },
};
