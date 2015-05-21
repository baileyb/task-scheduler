var yaml = require('js-yaml')
  , fs = require('fs')
  , S = require('string')
  , Resource = require('./resource')
  , Task = require('./task')
  , util = require('util');

function Scheduler() {
  this.tasks = {};
  this.resources = {};
  this.max_cores = 0;
  this.cannot_execute = []; // tasks that require more resources than we have
  this.ready = []; // tasks that are ready to be run
  this.total_tasks = 0;
  this.tasks_completed = 0;
  this.total_ticks = 0;
  this.scheduling_plan = '';
}

Scheduler.prototype.add_resources = function(config) {
  var config = yaml.safeLoad(fs.readFileSync(config, 'utf8'));
  for (var r in config) {
    var num_cores = config[r];
    this.resources[r] = new Resource(r, num_cores, this);
    if (this.max_cores < num_cores) {
      this.max_cores = num_cores;
    }
  }
}

Scheduler.prototype.add_tasks = function(config) {
  var config = yaml.safeLoad(fs.readFileSync(config, 'utf8'));
  for (var t in config) {
    // Add the basic task information
    var cores_required = config[t]["cores_required"];
    var execution_time = config[t]["execution_time"];
    this.tasks[t] = new Task(t, cores_required, execution_time, this);

    // Add dependencies for the current task
    if (config[t].hasOwnProperty("parent_tasks")) {
      var parent_tasks = config[t]["parent_tasks"].split(",");
      for (var p in parent_tasks) {
        var name = S(parent_tasks[p]).trim().s;
        this.tasks[t].add_dependency(name);
      }
    }
  }

  // Go through the task list, process dependencies, and look for gotchas
  for (var t in this.tasks) {

    // Process the dependencies for each task and add the watchers
    for (var d in this.tasks[t].dependencies) {
      var dependency_name = this.tasks[t].dependencies[d];
      this.tasks[dependency_name].add_watcher(this.tasks[t]);
    }

    if (this.tasks[t].cores_required > this.max_cores) {
      this.cannot_execute.push(this.tasks[t]);
      this.tasks[t].unable_to_process = true;
      this.total_tasks--;
    } else if (this.tasks[t].dependencies_met) {
      this.ready.push(this.tasks[t]);
    }

    this.total_tasks++;
  }
};

Scheduler.prototype.notify_ready = function(task_name) {
  console.log('[scheduler] Dependencies have been met for [' + task_name + '], will schedule ASAP');
  this.ready.push(this.tasks[task_name]);
};

Scheduler.prototype.notify_resource_available = function(task_name) {
  console.log('[scheduler] Completed [' + task_name + '] after ' + this.total_ticks + ' ticks');
  this.tasks_completed++;
};

Scheduler.prototype.next_tick = function() {
  this.total_ticks++;

  for (var r in this.resources) {
    this.resources[r].tick();
  }

  var retry = [];
  while (this.ready.length > 0) {
    var task = this.ready.pop();
    if (!task.unable_to_process) {
      if (!this.dispatch(task)) {
        retry.push(task);
      }
    }
  }

  this.ready = retry;
};

Scheduler.prototype.dispatch = function(task) {
  for (var r in this.resources) {
    var available_cores = this.resources[r].available_cores;
    if (available_cores >= task.cores_required) {
      console.log('[scheduler] Starting task [' + task.name + ']');
      this.resources[r].add_task(task);
      this.scheduling_plan += this.resources[r].name + ": " + task.name + "\n";
      return true;
    }
  }

  return false;
};

Scheduler.prototype.start = function() {
  if (this.ready.length == 0) {
    return false;
  }

  while (this.total_tasks > this.tasks_completed) {
    this.next_tick();
  }

  return true;
};

Scheduler.prototype.display_usage = function() {
  console.log('[scheduler] --- Current Resource Utlization ---');
  for (var r in this.resources) {
    this.resources[r].display_usage();
  }
};

Scheduler.prototype.display_scheduling_plan = function() {
  if (this.cannot_execute.length != 0) {
    for (var i in this.cannot_execute) {
      this.scheduling_plan += "Unable to process [" + this.cannot_execute[i].name + "] - no suitable resources available\n";
    }
  }
  return this.scheduling_plan;
};

module.exports = Scheduler;
