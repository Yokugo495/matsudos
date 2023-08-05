function getRandomUser() {
	const userList = document.getElementById("userlist");
	const randIndex = Math.floor(Math.random() * userlist.childElementCount);
	console.log(userlist.childNodes[randIndex].childNodes[1].innerText);
}