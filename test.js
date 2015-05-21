var Scheduler = require('./scheduler')
  , util = require('util');

var scenarios = {
  basic: {
    resources: './scenarios/basic/resources.yml',
    tasks: './scenarios/basic/tasks.yml'
  }
};

for (var s in scenarios) {
  console.log("---> Running scenario: " + s);
  scheduler = new Scheduler();
  scheduler.add_resources(scenarios[s].resources);
  scheduler.add_tasks(scenarios[s].tasks);
  scheduler.start();
  console.log("\n---> Scenario completed");
  console.log(scheduler.scheduling_plan);
}
