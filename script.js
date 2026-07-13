const divContainer = document.getElementById('container');
//==================
//DATA 
//==================

let tasksListDashboard = [];
let toggleModal = null;

function loadTaches(){
	if(localStorage.getItem('tasksListDashboard')){
		tasksListDashboard = JSON.parse(localStorage.getItem('tasksListDashboard'));
	}
}

loadTaches();

//=======================
//structures
//=======================

//les tâches
function createCard(title, length,taskStatus){
	const divCard = document.createElement('div');
	divCard.classList.add('carte',`${taskStatus}`);
	divCard.innerHTML =
	`<h3>${title}</h3>
	<p><span class="boldNumber">${length}</span> Taches</p>`
	return divCard;
}

function createCardEvolution(title,length, percentage,taskStatus){
	const divEvo = document.createElement('div');
	divEvo.classList.add('progression');
	divEvo.innerHTML = 
	`<h3>${title} <span>(${length})</span></h3>
	<div class='div1'>
		<div class='div2 ${taskStatus}' style='width:${percentage}%'>
			<div class='div3'>
				${percentage}%
			</div>
		</div>
	</div>
	`;
	return divEvo;
}
function cardThreeLastDoneTask(tasks){
	const threeLastDoneTask = getThreeLastDoneTasks(tasks);
	const div = document.createElement('div');
	div.classList.add('divLastTasks');
	const title = document.createElement('h3');
	title.textContent = "Trois dernières Tâches";
	div.appendChild(title);
	threeLastDoneTask.forEach(task =>{
		const li = document.createElement('li');
		li.textContent = task.task;
		div.appendChild(li);
	}
	);
	return div;
}
function cardInProgressTasks(tasks){
	const inProgressTasks = getInProgressTasks(tasks);
	const div = document.createElement('div');
	div.classList.add('inProgressTasks');
	const title = document.createElement('h3');
	title.textContent = "Tâches En Cours";
	div.appendChild(title);
	inProgressTasks.forEach(task =>{
		const li = document.createElement('li');
		li.textContent = task.task;
		div.appendChild(li);
	}
	);
	return div;
}
// la météo
async function createMeteoCard(container){
	const div1 = document.createElement('div');
	div1.classList.add('meteo');
	const title = document.createElement('h3');
	title.textContent = "La Météo";
	const LoadingStatus = document.createElement('p');
	const div2 = document.createElement('div');
	const pLieu = document.createElement('p');
	const pTemp = document.createElement('p');
	const pCondition = document.createElement('p');
	div1.appendChild(title);
	div1.appendChild(LoadingStatus);
	div1.appendChild(div2);
	div2.appendChild(pLieu);
	div2.appendChild(pTemp);
	div2.appendChild(pCondition);
	container.appendChild(div1);
	LoadingStatus.textContent = "Loading..."
	try{
		const data = await getWeather();
		LoadingStatus.textContent = "";
		pLieu.innerHTML = `<span style="font-weight: bold">Lieu : </span>${data.lieu}`;
		pTemp.innerHTML = `<span style="font-weight: bold">Température : </span>${data.temp}`;
		pCondition.innerHTML = `<span style="font-weight: bold">Condition: </span>${data.condition}`;
	}
	catch(error){
		LoadingStatus.innerHTML =`<span style="color: red"> ${error}</span>`;
	}
};
// Clock
function createClock(container){
	const divClock = document.createElement('div');
	divClock.classList.add('clock');
	container.appendChild(divClock);	
	return divClock;
}
//autres
function updateClock(){
	const now = new Date();
	const time = now.toLocaleTimeString('fr-FR',{
		hour: '2-digit',
		minute : '2-digit',
		second : '2-digit'
	});
	document.querySelector('.clock').textContent = time;
}
function getThreeLastDoneTasks(tasks){
	const doneTasks = tasks.filter(task => task.status === "Done");
	return doneTasks.slice(-3);	
	
}
function getInProgressTasks(tasks){
	const inProgressTasks = tasks.filter(task => task.status === "Doing");
	return inProgressTasks;
}
function getWeather(){
	return new Promise((resolve, reject)=>{
		setTimeout(()=>{
			const succes = Math.random() > 0.3;
			if(succes){
				resolve({
					lieu: "Tana",
					temp: 24,
					condition: "🌤️ ensoleillé"
				})
			} else {
				reject("Impossible d'afficher la Météo, veillez réessayer.")
			}
		},2000);
	});
}

//============
//stats
//============
function getStats(tasks){
	let tousLesTaches = tasks.length;
	let done = 0;
	let todo = 0;
	let doing = 0;
	for(const task of tasks){
		if(task.status === "Done") done++;
		if(task.status === "Doing") doing++;
		if(task.status === "ToDo") todo++;
	}
	let donePercentage =  tousLesTaches === 0 ? 0 : ((done/tousLesTaches)*100).toFixed(0);
	let todoPercentage = tousLesTaches === 0 ? 0 : ((todo/tousLesTaches)*100).toFixed(0);
	let doingPercentage = tousLesTaches === 0 ? 0 : ((doing/tousLesTaches)*100).toFixed(0);
	const stats = {
		allTasks : tousLesTaches,
		done : done,
		todo : todo,
		doing: doing,
		donePercentage : donePercentage,
		todoPercentage : todoPercentage,
		doingPercentage : doingPercentage
	}
	return stats;
}
//============
//Creation Modal
//============ 
function createModal(){
	const overlay = document.createElement('div');
	overlay.classList.add('overlay','hidden');
	const modal = document.createElement('div');
	modal.classList.add('modal');
	const closeBtn = document.createElement('button');
	closeBtn.textContent = "Fermer";
	closeBtn.classList.add('closeButton');
	modal.appendChild(closeBtn);
	const inputValidationContainer = document.createElement('div');
	inputValidationContainer.id = 'addTaskContainer';
	inputValidationContainer.innerHTML =`<input type="text" id="inputTask" placeholder="Votre tâche ici"required>
	<button id="addTaskBtn" type="button">Ajouter la tâche</button>`;
	modal.appendChild(inputValidationContainer);
	const cardsContainer = document.createElement('div');
	cardsContainer.id = "cartesContainer";
	cardsContainer.innerHTML = `<h2>Liste des tâches</h2>
				<div id="cartes">
					<div id="carteToDo" class="carteItem">
						<h2 class="cartetitle">À faire</h2>
						<div id="tachesTodo">
						</div>
					</div>
					<div id="carteDoing" class="carteItem">
						<h2 class="cartetitle">En cours</h2>
						<div id="tachesDoing">
						</div>
					</div>
					<div id="carteDone" class="carteItem">
						<h2 class="cartetitle">Terminées</h2>
						<div id="tachesDone">
						</div>
					</div>
				</div>`;
	modal.appendChild(cardsContainer);
	
	overlay.appendChild(modal);
	return {overlay,closeBtn,modal};
}
// modal DATA
function setModalData(){
	const tachesTodo = document.getElementById('tachesTodo');
	const tachesDoing = document.getElementById('tachesDoing');
	const tachesDone = document.getElementById('tachesDone');

	const inputTask = document.getElementById('inputTask');
	const addBtn = document.getElementById('addTaskBtn');

	//fonctions rattachées aux bouton
	function passToDoing(el){
		el.status = carteDoing["status"];
		renderAllCarte();
		saveTasks();
	}
	function passToDone(el){
		el.status = carteDone["status"];
		renderAllCarte();
		saveTasks();
	}
	function deleteTask(el){
		tasksListDashboard = tasksListDashboard.filter(task => task.id !== el.id);
		renderAllCarte();
		saveTasks();
	}
	// les cartes en tant qu'objet
	const carteTodo = 
	{
		"carte name": tachesTodo,
		status: "ToDo",
		"text button": "➡️",
		"button function": passToDoing,
	}

	const carteDoing = 
	{
		"carte name": tachesDoing,
		status: "Doing",
		"text button": "➡️",
		"button function": passToDone,
	}

	const carteDone = 
	{
		"carte name": tachesDone,
		status: "Done",
			"text button": "Supprimer",
		"button function": deleteTask,
	}
	//fonction  vérification si input vide
	function isInputVide(){
		return !inputTask.value.trim();
	}
	//fonction blockage bouton ajout si input vide
	function blockAddBtn(){
		if(isInputVide()){
			addBtn.disabled = true;
		} else {
			addBtn.disabled = false;
		}
	}
	blockAddBtn();
	inputTask.addEventListener('input',blockAddBtn);

	//fonction qui permet de valider l'input avec le bouton entrée
	inputTask.addEventListener('keypress',(e) => {
		if(e.key === 'Enter'){
			e.preventDefault();
			getTasks();
		}
	})

	//fonction pour la création de chaque objet task dans tasksListDashboard.
	function getTasks(){
		if(isInputVide()) return;
		const inputText = inputTask.value.trim();
		const date = Date.now();
		tasksListDashboard.push({
			id : date,
			task: inputText,
			status : carteTodo["status"]
		});
		saveTasks();
		inputTask.value = "";
		blockAddBtn();
		renderAllCarte();
	}

	//écouteur d'événement pour le bouton d'ajout de tâche
	addBtn.addEventListener('click',getTasks);


	//mise en page des tâches à faire

	function renderCarte(carte){
		carte["carte name"].textContent = "";
		const filterd = tasksListDashboard.filter(task => task.status === carte.status);
		filterd.forEach(el => {
			const p = document.createElement('p');
			const spanText = document.createElement('span');
			const btn = document.createElement('button');
			spanText.textContent = el.task;
			spanText.classList.add('text');
			p.appendChild(spanText);
			btn.textContent = carte["text button"];
			btn.addEventListener('click', () => carte["button function"](el));
			p.appendChild(btn);
			carte["carte name"].appendChild(p);
		});
	}

	// fonction pour afficher les cartes
	function renderAllCarte(){
		renderCarte(carteTodo);
		renderCarte(carteDoing);
		renderCarte(carteDone);
	}

	//fonction pour sauvegarder les tâches
	function saveTasks(){
	localStorage.setItem('tasksListDashboard',JSON.stringify(tasksListDashboard));
	}

	//fonction pour lire les tâches enregistrés
	renderAllCarte();
}
//modal événement
function setEventModal(overlay,closeBtn,modal){
	let isOpen = false;
	
	function toggle(){
		isOpen = !isOpen;
		overlay.classList.toggle('hidden', !isOpen);
	}
	closeBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		isOpen = false;
		overlay.classList.add('hidden');
		updateDashboardStats();;
	});
	
	overlay.addEventListener('click', ()=>{
		isOpen = false;
		overlay.classList.add('hidden');
		updateDashboardStats();;
	});
	modal.addEventListener('click',(e)=>{
		e.stopPropagation();
	});
	return toggle;
}
//============
//rendu
//============
// Ne crée le dashboard qu'une seule fois
function renderDashboard(tasks) {
    divContainer.textContent = "";

    const stats = getStats(tasks);

    const tasksCardContainer = document.createElement('div');
    tasksCardContainer.classList.add('tasksCardContainer');

    const divStatusTask = document.createElement('div');
    divStatusTask.classList.add('divStatusTask');

    const cards = [
        createCard("Toutes les Tâches", stats.allTasks, "all"),
        createCard("Tâches restantes", stats.todo, "todo"),
        createCard("Tâches En cours", stats.doing, "doing"),
        createCard("Tâches Terminées", stats.done, "done")
    ];
    cards.forEach(card => divStatusTask.appendChild(card));

    const divEvolutionTask = document.createElement('div');
    divEvolutionTask.classList.add('divEvolutionTask');
    const divProgression = document.createElement('div');
    divProgression.classList.add('divProgression');

    [
        createCardEvolution("Tâches restantes", stats.todo, stats.todoPercentage, "todo"),
        createCardEvolution("Tâches En cours", stats.doing, stats.doingPercentage, "doing"),
        createCardEvolution("Tâches Terminées", stats.done, stats.donePercentage, "done")
    ].forEach(card => divProgression.appendChild(card));

    tasksCardContainer.appendChild(divStatusTask);
    tasksCardContainer.appendChild(divEvolutionTask);

    const overPrecision = document.createElement('div');
    overPrecision.classList.add('overPrecision');

    overPrecision.appendChild(cardThreeLastDoneTask(tasks));
    overPrecision.appendChild(cardInProgressTasks(tasks));

    divEvolutionTask.appendChild(divProgression);
    divEvolutionTask.appendChild(overPrecision);

    const overCardContainer = document.createElement('div');
    overCardContainer.classList.add('overCardContainer');
    createMeteoCard(overCardContainer);

    divContainer.appendChild(tasksCardContainer);
    divContainer.appendChild(overCardContainer);
    createClock(overCardContainer);
    setInterval(updateClock, 1000);

    // retourne les cards pour y attacher les événements
    return cards;
}

// Met à jour uniquement les stats (appelé à la fermeture du modal)
function updateDashboardStats() {
    const newCards = renderDashboard(tasksListDashboard);
    if (toggleModal) {
        newCards.forEach(card => card.addEventListener('click', toggleModal));
    }
}

function renderAll(tasks) {
    // Modal (créé une seule fois)
    const { overlay, closeBtn, modal } = createModal();
    const main = document.getElementById('main');
    main.appendChild(overlay);
    setModalData();

    toggleModal = setEventModal(overlay, closeBtn, modal);

    // Dashboard (créé une seule fois)
    const cards = renderDashboard(tasks);
    cards.forEach(card => card.addEventListener('click', toggleModal));
}

renderAll(tasksListDashboard);

