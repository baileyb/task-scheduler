var Scheduler = require('./scheduler')
  , util = require('util');

scheduler = new Scheduler();
scheduler.add_resources('./scenarios/basic/resources.yml');
scheduler.add_tasks('./scenarios/basic/tasks.yml');
scheduler.start();
