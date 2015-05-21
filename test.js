var Scheduler = require('./scheduler')
  , util = require('util');

var scenarios = {
  basic: {
    resources: './scenarios/basic/resources.yml',
    tasks: './scenarios/basic/tasks.yml'
  },
  cant_start: {
    resources: './scenarios/cant_start/resources.yml',
    tasks: './scenarios/cant_start/tasks.yml'
  },
  equal: {
    resources: './scenarios/equal/resources.yml',
    tasks: './scenarios/equal/tasks.yml'
  }
};

for (var s in scenarios) {
  console.log("---> Running scenario: " + s);
  scheduler = new Scheduler();
  scheduler.add_resources(scenarios[s].resources);
  scheduler.add_tasks(scenarios[s].tasks);
  if (scheduler.start()) {
    console.log("\n---> Scenario completed");
    console.log(scheduler.scheduling_plan);
  } else {
    console.log("FAIL: unable to run this scenario - there are no tasks that can be run (check dependencies)\n");
  }
}
