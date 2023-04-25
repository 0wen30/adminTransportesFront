import './style.css'

type consultaResponse = { 
	fieldCount: number, 
	affectedRows: number, 
	insertId: number, 
	serverStatus: number, 
	warningCount: number, 
	message: string, 
	protocol41: boolean, 
	changedRows: number 
};

interface Unidad {
	id:number,
	unidad: number
	clase?: string
	tipo?: string
	tipoCombustible?: string
	marca?: string
	modelo?: string
	placas?: string
	capacidad?: number
	peso?: number
	kilometros?: number
}

const headerRow = document.createElement('tr');
const table = document.createElement('table');
const boton_actualizar = document.createElement('button');
const boton_submit = document.createElement('button');
const formulario = document.createElement('formulario');
const ventana_modal = document.createElement('dialog');
const boton_agregar = document.createElement('button');
const titulo_seccion = document.createElement('h2');
const thead = document.createElement('thead');
const tbody = document.createElement('tbody');
const msg_cerrar_modal = document.createElement('small');

const label_unidad = document.createElement('label');
const input_unidad = document.createElement('input');

async function main() {

	await cargarFilas();

	label_unidad.htmlFor = 'unidad';
	label_unidad.textContent = 'Unidad:';
	input_unidad.type = 'text';
	input_unidad.name = 'unidad';
	input_unidad.required = true;

	titulo_seccion.textContent = 'Unidades';
	boton_agregar.className = 'boton_agregar';
	boton_agregar.textContent = 'Agregar';
	boton_submit.type = 'submit';
	boton_submit.textContent = 'Agregar';
	boton_actualizar.type = 'button';
	boton_actualizar.textContent = 'Actualizar';
	msg_cerrar_modal.textContent = "Presiona la tecla Esc para cerrar la ventana.";

	/*------------------------------------------------------------------*/

	const headers = ['id', 'unidad','Acciones'];

	/*------------------------------------------------------------------*/

	headers.forEach((header, index) => {
		const th = document.createElement('th');
		th.textContent = header;
		if (index === headers.length - 1) {
			th.colSpan = 2;
		}
		headerRow.appendChild(th);
	});

	boton_submit.addEventListener('click', async () => {
		const result: consultaResponse = await agregarEntidad();
		if (result.affectedRows > 0) {
			await cargarFilas();
			input_unidad.value = '';
			ventana_modal.close();
		}
	});

	boton_agregar.addEventListener('click', () => {
		boton_actualizar.style.display = 'none';
		ventana_modal.showModal();
		input_unidad.value = '';
	});

	ventana_modal.addEventListener('close', () => {
		boton_actualizar.style.display = 'inline-block';
		boton_submit.style.display = 'inline-block';
	});

	thead.appendChild(headerRow);
	table.appendChild(thead);
	table.appendChild(tbody);
	ventana_modal.appendChild(formulario);
	ventana_modal.appendChild(msg_cerrar_modal);
	document.body.appendChild(titulo_seccion);
	document.body.appendChild(boton_agregar);
	document.body.appendChild(ventana_modal);
	document.body.appendChild(table);

	/*------------------------------------------------------------------*/

	formulario.appendChild(label_unidad);
	formulario.appendChild(input_unidad);

	/*------------------------------------------------------------------*/

	formulario.appendChild(boton_submit);
	formulario.appendChild(boton_actualizar);

}

async function cargarFilas() {

	tbody.innerHTML = "";

	const data: Unidad[] = await traerDatos();

	data.forEach((data) => {
		const tr = document.createElement('tr');
		Object.values(data).forEach((value) => {
			const td = document.createElement('td');
			td.textContent = value;
			tr.appendChild(td);
		});

		const btnEdit = document.createElement('td');
		const btnDelete = document.createElement('td');

		btnEdit.textContent = '📄'
		btnDelete.textContent = '❌'
		btnEdit.className = 'btnEdit'
		btnDelete.className = 'btnDelete'

		btnEdit.addEventListener('click', () => {
			boton_submit.style.display = 'none';
			ventana_modal.showModal();
			input_unidad.value = data.unidad + "";
			boton_actualizar.addEventListener('click', async () => {
				await editarEntidad(data.id);
				await cargarFilas();
				ventana_modal.close();
			}, { once: true });
		});

		btnDelete.addEventListener('click', async () => {
			await eliminarEntidad(data.id);
			await cargarFilas();
		}, { once: true });

		tr.appendChild(btnEdit);
		tr.appendChild(btnDelete);
		tbody.appendChild(tr);

	});

}

async function traerDatos(): Promise<Unidad[]> {
	const unidades = <Unidad[]>await (await fetch("http://localhost:3000/unidades")).json();
	return unidades;
}

async function agregarEntidad(): Promise<consultaResponse> {
	const response = await fetch('http://localhost:3000/unidades', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ unidad: input_unidad.value }),
	});

	const result = <consultaResponse>await response.json()
	return result;
}

async function editarEntidad(id: number): Promise<consultaResponse> {
	const response = await fetch(`http://localhost:3000/unidades/?id=${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ unidad: input_unidad.value }),
	});
	const result = <consultaResponse>await response.json()
	return result;
}

async function eliminarEntidad(id: number): Promise<consultaResponse> {
	const response = await fetch(`http://localhost:3000/unidades/?id=${id}`, {
		method: 'DELETE',
	});
	const result = <consultaResponse>await response.json()
	console.log(result)
	return result;
}

window.onload = main;