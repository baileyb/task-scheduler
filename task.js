function Task(name, cores_required, execution_time, scheduler) {
  this.name = name;
  this.cores_required = cores_required;
  this.execution_time = execution_time;
  this.dependencies = [];
  this.dependencies_met = true;
  this.watchers = [];
  this.scheduler = scheduler;
}

Task.prototype.add_watcher = function(task) {
  this.watchers.push(task);
};

Task.prototype.add_dependency = function(task_name) {
  this.dependencies.push(task_name);
  this.dependencies_met = false;
};

Task.prototype.resolve_dependency = function(task_name) {
  var index = this.dependencies.indexOf(task_name);
  if (index > -1) {
    this.dependencies.splice(index, 1);
    if (this.dependencies.length == 0) {
      this.dependencies_met = true;
      this.scheduler.notify_ready(this.name);
    }
  }
};

Task.prototype.assign_resource = function(resource) {
  this.resource = resource;
};

Task.prototype.tick = function() {
  this.execution_time--;
  if (this.execution_time == 0) {
    this.complete();
  }
};

Task.prototype.complete = function() {
  this.resource.notify_task_complete(this.name);
  for (var w in this.watchers) {
    this.watchers[w].resolve_dependency(this.name);
  }
};

module.exports = Task;
