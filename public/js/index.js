const username = document.getElementById('username')
const room = document.getElementById('room')
const checkbox = document.getElementById('checkbox');
console.log(checkbox.value)
checkbox.addEventListener('click', () => {
    console.log("clicked")
    if(checkbox.checked) {
        // Checkbox is checked: username and room required
        console.log("checked")
        checkbox.value = "true"
        username.removeAttribute("disabled")
        room.removeAttribute("disabled")
        username.setAttribute("required", "true")
        room.setAttribute("required", "true")
    } else {
        // Checkbox is not checked: username and room NOT required
        console.log("unchecked")
        checkbox.value = "false"
        username.value = ""
        room.value = ""
        username.removeAttribute("required")
        room.removeAttribute("required")
        username.setAttribute("disabled", "true")
        room.setAttribute("disabled", "true")
    }
    console.log(checkbox.value)
});

// const offline = document.getElementById('offline')
// const online = document.getElementById('online')
// const onlineInfo = document.getElementById('online-info')
// offline.addEventListener("click", () => {
//     username.removeAttribute("required")
//     room.removeAttribute("required")
//     onlineInfo.style.display = "none"
// })

// online.addEventListener("click", () => {
//     onlineInfo.style.display = "block"
//     username.setAttribute("required", "true")
//     room.setAttribute("required", "true")
// })