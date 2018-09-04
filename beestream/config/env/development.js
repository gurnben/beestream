module.exports = {
  // Development Configuration Options
  //our database address
  db : 'mongodb://localhost/beestream-dev',
  //viewable hives
  avaliableHives: ['rpi1b', 'rpi21', 'rpi22', 'rpi24'],
  //Path to the directory containing hive folders
  videoPath: '/var/run/user/1000/gvfs/sftp:host=cs.appstate.edu,user=bee/usr/local/bee/beemon',
  //Path to the directory containing beet
  beetPath: '/home/gurnben/PycharmProjects/beet/',
  //Path to the ffmpeg installation
  ffmpegPath: '',
  tags: ['Pollen', 'Drones', 'Queen', 'High Traffic', 'Low Traffic',
         'Other Insects', 'Odd Behavior', 'Fanning', 'Swarm', 'Washboarding',
         'Yellow Jacket/Wasp', 'Dead Bees', 'Deformed Bee'],
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
    'rpi11b': [
      {
        rectangle: '100 100 100 100',
        triangle: '100 100 100 100 100 100',
        start: '2000-00-00T00:00:00',
        end: 'present'
      }
    ],
    'rpi1b': [
      {
        rectangle: '170 218 105 225',
        triangle: '155 310 425 310 290 185',
        start: '2016-09-21T12:25:00',
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
