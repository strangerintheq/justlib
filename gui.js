function slider(name, min, max, value = (max + min) / 2) {
    let gui = document.querySelector(".gui");
    if (!gui) {
        gui = document.createElement('div')
        gui.classList.add('gui');
        gui.innerHTML = `<style>
            .gui {
                position: fixed;
                top: 0;
                left: 0;
                background: azure;
            }
            .slider {
                display: grid;
                grid-template-columns: auto 150px 75px;
                font-size: 20px;
                font-family: Arial, sans-serif;
            }
            .slider input {
                width: 100%;
            }
            .slider .name, .slider .value {
                padding: 5px;
            }
        </style>`;
        document.body.append(gui);
    }
    const tmp = document.createElement('div')
    tmp.innerHTML = `<div class="slider">
        <div class="name">${name}</div>
        <input  type="range" min="${min}" max="${max}" step="${(max-min)/100}" value="${value}">
        <div class="value">${(+value).toFixed(4)}</div>
    </div>`
    const valueDiv = tmp.querySelector('.value');
    const input = tmp.querySelector('input');
    input.addEventListener('input', () => {
        valueDiv.innerHTML = (+input.value).toFixed(4);
        redraw()
    });
    gui.append(tmp.querySelector('div'));
    return input;
}

