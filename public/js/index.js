const username = document.getElementById('username')
const room = document.getElementById('room')
const checkbox = document.getElementById('checkbox');

checkbox.addEventListener('click', () => {
    if(checkbox.checked) {
        // Checkbox is checked: username and room required
        checkbox.value = "true"
        username.removeAttribute("disabled")
        room.removeAttribute("disabled")
        username.setAttribute("required", "true")
        room.setAttribute("required", "true")
    } else {
        // Checkbox is not checked: username and room NOT required
        checkbox.value = "false"
        username.value = ""
        room.value = ""
        username.removeAttribute("required")
        room.removeAttribute("required")
        username.setAttribute("disabled", "true")
        room.setAttribute("disabled", "true")
    }
});

