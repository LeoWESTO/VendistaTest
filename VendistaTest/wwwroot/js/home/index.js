(function () {
    const token = 'f0d17d3cae184917802e2ef2'; /*token должен браться после авторизации из local storage*/

    const cancelBtn = document.getElementById("cancelBtn");
    const submitBtn = document.getElementById("submitBtn");
    const terminalIdsTextArea = document.getElementById("terminalIds");
    const commandsSelect = document.getElementById("commandsSelect");
    const commandsTable = document.getElementById('commands_tbody');
    const parametersContainer = document.querySelector('.parameters_container');

    let commands = {};

    async function loadCommands() {
        const dataUrl = `Home/GetCommands?token=${token}`;

        try {
            const response = await fetch(dataUrl);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            commands = await response.json();

            const defaultOption = document.createElement("option");
            defaultOption.text = 'Не выбрано';
            defaultOption.value = 0;
            defaultOption.selected = true;
            commandsSelect.appendChild(defaultOption);

            for (const item of commands.items) {
                if (item.visible) {
                    const option = document.createElement("option");
                    option.text = `⚬ ${item.name}`;
                    option.value = item.id;
                    commandsSelect.appendChild(option);
                }
            }

        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    function postCommand() {
        try {
            const ids = document.getElementById("terminalIds").value.split(/(?:,| )+/).filter(item => !isNaN(parseFloat(item)));
            const selectedCommand = commands.items.filter(command => command.id == commandsSelect.value)[0];
            let command = {
                "command_id": selectedCommand.id,
                "parameter1": selectedCommand.parameter_name1 != null ? document.getElementById("parameter1").value : 0,
                "parameter2": selectedCommand.parameter_name2 != null ? document.getElementById("parameter2").value : 0,
                "parameter3": selectedCommand.parameter_name3 != null ? document.getElementById("parameter3").value : 0,
            }
            ids.forEach(id => {
                const dataUrl = `Home/PostTerminalCommand?id=${id}&token=${token}`;

                fetch(dataUrl, {
                    method: "POST",
                    headers: {
                        "accept": "text/plain",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(command),
                }).then(res => res.json()).then(data => {
                    loadTerminalsCommands();
                });
            });
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    function loadTerminalsCommands() {
        try {
            const ids = document.getElementById("terminalIds").value.split(/(?:,| )+/).filter(item => !isNaN(parseFloat(item)));
            commandsTable.innerHTML = '';
            let data = {}
            ids.forEach(id => {
                const dataUrl = `Home/GetTerminalCommands?id=${id}&token=${token}`;

                fetch(dataUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }).then(response => response.json()).then(response => generateTable(response));


            });

        } catch (error) {
            console.error('Error:', error.message);
        }

    };

    function generateTable(data) {
        let count = 1;
        data.items.sort(function (a, b) {
            return new Date(b.time_created) - new Date(a.time_created);
        });

        data.items.forEach(item => {
            commandsTable.innerHTML += `
                <tr>
                    <td>${count++}</td>
                    <td>${item.time_created} </td>
                    <td>${commands.items.filter(command => command.id == item.command_id)[0].name}</td>
                    <td>${item.parameter1}</td>
                    <td>${item.parameter2}</td>
                    <td>${item.parameter3}</td>
                    <td>${item.state_name}</td>
                </tr>
                `;
        });
    }

    function generateParams() {
        try {
            parametersContainer.innerHTML = "";
            const command = commands.items.filter(command => command.id == commandsSelect.value)[0];
            if (command === undefined) return;

            if (command.parameter_name1 != null) {
                parametersContainer.innerHTML += `
                <div class="parameter">
                    <h5>${command.parameter_name1}</h5>
                    <input type="text" id="parameter1" value="${command.parameter_default_value1}">
                </div>
            `;
            }
            if (command.parameter_name2 != null) {
                parametersContainer.innerHTML += `
                <div class="parameter" id="parameter1">
                    <h5>${command.parameter_name2}</h5>
                    <input type="text" id="parameter2" value="${command.parameter_default_value2}">
                </div>
            `;
            }
            if (command.parameter_name3 != null) {
                parametersContainer.innerHTML += `
                <div class="parameter" id="parameter1">
                    <h5>${command.parameter_name3}</h5>
                    <input type="text" id="parameter3" value="${command.parameter_default_value3}">
                </div>
            `;
            }
        } catch (error) {
            console.error('Error:', error.message);
        }

    };

    function clearFields() {
        terminalIdsTextArea.value = "";
        parametersContainer.innerHTML = "";
        commandsTable.innerHTML = "";
        commandsSelect.selectedIndex = 0;
    }

    terminalIdsTextArea.addEventListener("blur", loadTerminalsCommands);
    commandsSelect.addEventListener("change", generateParams);
    submitBtn.addEventListener("click", postCommand);
    cancelBtn.addEventListener("click", clearFields);

    loadCommands();
})();