module.exports = {
  // Development Configuration Options
  db : 'mongodb://localhost/beestream-dev', //our database address
  sessionSecret : 'developmentSessionSecret', //TODO: Change session secret
  avaliableHives: ['rpi1b', 'rpi21', 'rpi22', 'rpi24'],
  hivePath: '/home/gurnben/Projects/video_service'
};
