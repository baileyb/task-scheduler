function Resource(name, cores, scheduler) {
  this.name = name;
  this.cores = cores;
  this.scheduler = scheduler;
  this.available_cores = this.cores;
  this.current_tasks = {};
};

Resource.prototype.add_task = function(task) {
  task.assign_resource(this);
  this.available_cores = this.available_cores - task.cores_required;
  this.current_tasks[task.name] = task;
};

Resource.prototype.notify_task_complete = function(task_name) {
  this.available_cores = this.available_cores + this.current_tasks[task_name].cores_required;
  delete this.current_tasks[task_name];
  this.scheduler.notify_resource_available(task_name);
};

Resource.prototype.tick = function() {
  for (var t in this.current_tasks) {
    this.current_tasks[t].tick();
  }
};

Resource.prototype.display_usage = function() {
  var utilized = this.cores - this.available_cores;

  if (utilized == 0) {
    console.log('---> [' + this.name + '] Core Allocation: ' + this.cores + ' total, ' + utilized + ' utilized');
  } else {
    var task_list = '';
    for (var t in this.current_tasks) {
      task_list += '[' + this.current_tasks[t].name + '] (' + this.current_tasks[t].cores_required + ') ';
    }
    console.log('---> [' + this.name + '] Core Allocation: ' + this.cores + ' total, ' + utilized + ' utilized -- ' + task_list);
  }
};

module.exports = Resource;
