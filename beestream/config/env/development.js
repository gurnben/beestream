module.exports = {
  // Development Configuration Options
  //our database address
  db : 'mongodb://localhost/beestream-dev',
  //viewable hives
  avaliableHives: ['rpi1b', 'rpi21', 'rpi22', 'rpi24'],
  //Path to the directory containing hive folders
  videoPath: '/home/gurnben/Projects/video_service',
  //Path to the directory containing beet
  beetPath: '/home/gurnben/PycharmProjects/beet/',
  //Path to the ffmpeg installation
  ffmpegPath: '',
  tags: ['Pollen', 'Drones', 'Queen', 'High Traffic', 'Low Traffic',
         'Other Insects', 'Odd Behavior', 'Fanning', 'Swarm'],
  /*Entrance configurations in the format:
  * hive: [
  *   {
  *     rectangle: 'entrance config',
  *     triangle: 'entrance config',
  *     start: 'first valid datetime in format: YYYY-MM-DDTHH:MM:SS',
  *     end: 'last valid datetime in format: YYYY-MM-DDTHH:MM:SS or present',
  *   }
  *]
  */
  entranceBounds: {
    'rpi1b': [
      {
        rectangle: '170 218 105 225',
        triangle: '155 310 425 310 290 185',
        start: '2017-09-21T12:25:00',
        end: '2017-12-30T12:45:00'
      },
      {
        rectangle: '170 218 105 225',
        triangle: '155 310 425 310 290 185',
        start: '2017-12-30T12:45:00',
        end: 'present'
      }
    ]
  }
};
