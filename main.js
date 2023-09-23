var tasksRecord = JSON.parse(localStorage.getItem("DoropomoTasksRecord"));
var tasksDescription = JSON.parse(localStorage.getItem("DoropomoTasksDescription"));

if (tasksRecord == undefined){
	tasksRecord = []
}

if (tasksDescription == undefined){
	tasksDescription = {}
}

var timer = {
	minutes:0,
	seconds:0,
	reset: function (){
		this.minutes = 0;
		this.seconds = 0;
	},
	update: function (){
		document.getElementById("timer-min").textContent = this.minutes;
		document.getElementById("timer-sec").textContent = this.seconds;
	},
	start: function (){
		this.reset();
		this.interval = setInterval(()=>{
			this.update()
			this.seconds++;
			if (this.seconds >= 60){
				this.seconds = 0;
				this.minutes++;
			}
		}, 1000)
	},
	stop: function (){
		clearInterval(this.interval);
	}
}

var timerPassive = {
	minutes:0,
	start: function (){
		this.minutes = 0;
		this.interval = setInterval(()=>{
			this.minutes++;
		}, 60000)
	},
	stop: function (){
		newRecord("Passive", this.minutes);
		clearInterval(this.interval);
	}
}

timerPassive.start()

let taskSelectorElm = document.querySelector("#task-controller select");
let descriptionBoxElm = document.querySelector("#task-controller textarea");

taskSelectorElm.addEventListener("click", ()=>{
	let taskName = taskSelectorElm.value;
	if (taskName == "Select"){
		descriptionBoxElm.value = ''
		document.getElementById("task").style.display = "";
		document.getElementById("deselect-button").style.display = "none";
	} else{
		descriptionBoxElm.value = tasksDescription[taskName]
		document.getElementById("task").style.display = "none";
		document.getElementById("deselect-button").style.display = "";
	}
});

descriptionBoxElm.addEventListener("keyup", ()=>{
	let taskName = taskSelectorElm.value;
	if (taskName != "Select"){
		newDescription(taskName, descriptionBoxElm.value)
	}
})

function newRecord(taskName, taskDuration){
	tasksRecord.push({"name":taskName, "duration":taskDuration});
	if (tasksRecord.length > 128){
		tasksRecord = tasksRecord.slice(0, 128)
	}
	localStorage.setItem("DoropomoTasksRecord", JSON.stringify(tasksRecord));
	updateTasksList();
}

function newDescription(taskName, taskDescription){
	tasksDescription[taskName] = taskDescription;
	saveTasksDescriptions()
}

function saveTasksDescriptions(){
	localStorage.setItem("DoropomoTasksDescription", JSON.stringify(tasksDescription));
}

function updateTasksList(){
	let tasksTBody = document.querySelector("table > tbody");
	tasksTBody.innerHTML = '';
	let taskName;
	for (let i=tasksRecord.length-1; i>=0; i--){
		taskName = tasksRecord[i]["name"]
		taskDuration = tasksRecord[i]["duration"]
		tasksTBody.innerHTML += `
		<tr>
			<td>
				${taskName}
			</td>
			<td>
				${taskDuration}
			</td>
		</tr>
		`;
	}
}

function updateTaskSelector(){
	taskSelectorElm.innerHTML = '';
	taskSelectorElm.innerHTML += "<option>Select</option>";
	for (let taskName of Object.keys(tasksDescription)){
		taskSelectorElm.innerHTML += "<option>" + taskName + "</option>";
	}
}

function deselect(){
	let taskName = taskSelectorElm.value;
	document.getElementById("task").value = taskName;
	taskSelectorElm.value = "Select";

	delete tasksDescription[taskName]
	saveTasksDescriptions()

	updateTaskSelector()

	document.getElementById("task").style.display = "";
	document.getElementById("deselect-button").style.display = "none";
}

function configTimer(){
	if (document.getElementById("time-controller").textContent == "Tick"){
		startTimer()
	} else{
		stopTimer()
	}
}

function startTimer(){
	if (taskSelectorElm.value == "Select"){
		var taskName = document.getElementById("task").value;
		if (taskName == '' || tasksDescription[taskName] != undefined){return;}
		document.getElementById("task").value = '';

		newDescription(taskName, descriptionBoxElm.value)

		taskSelectorElm.innerHTML += "<option>" + taskName + "</option>";
		taskSelectorElm.value = taskName;
		document.getElementById("task").style.display = "none";
	} else{
		var taskName = taskSelectorElm.value;
	}

	document.getElementById("task-name").textContent = taskName;
	
	document.getElementById("entry").style.display = "none";
	document.getElementById("history-view").style.display = "none";
	timerPassive.stop()
	timer.start();
	document.getElementById("time-controller").textContent = "Tock"
}

function stopTimer(){
	document.getElementById("entry").style.display = '';
	document.getElementById("history-view").style.display = '';
	newRecord(taskSelectorElm.value, timer.minutes);
	timer.stop()
	timer.reset()
	timer.update()
	timerPassive.start();
	document.getElementById("task-name").textContent = "Next?";
	document.getElementById("time-controller").textContent = "Tick"
}


updateTasksList()
updateTaskSelector()
