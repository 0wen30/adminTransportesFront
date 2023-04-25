import './style.css'

interface Proveedor { id: number, nombre: string, comentario?: string }

type consultaResponse = { fieldCount: number, affectedRows: number, insertId: number, serverStatus: number, warningCount: number, message: string, protocol41: boolean, changedRows: number };

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

const label_nombre = document.createElement('label');
const input_nombre = document.createElement('input');
const label_comentario = document.createElement('label');
const input_comentario = document.createElement('input');

async function main() {

	await cargarFilas();

	label_nombre.htmlFor = 'nombre';
	label_nombre.textContent = 'Nombre:';
	input_nombre.type = 'text';
	input_nombre.name = 'nombre';
	input_nombre.required = true;
	label_comentario.htmlFor = 'comentario';
	label_comentario.textContent = 'comentario:';
	input_comentario.type = 'text';
	input_comentario.name = 'comentario';
	
	titulo_seccion.textContent = 'Proveedores';
	boton_agregar.className = 'boton_agregar';
	boton_agregar.textContent = 'Agregar';
	boton_submit.type = 'submit';
	boton_submit.textContent = 'Agregar';
	boton_actualizar.type = 'button';
	boton_actualizar.textContent = 'Actualizar';
	msg_cerrar_modal.textContent = "Presiona la tecla Esc para cerrar la ventana.";

	/*------------------------------------------------------------------*/

	const headers = ['id', 'nombre','comentario','Acciones'];

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
			input_nombre.value = '';
			input_comentario.value = '';
			ventana_modal.close();
		}
	});

	boton_agregar.addEventListener('click', () => {
		boton_actualizar.style.display = 'none';
		ventana_modal.showModal();
		input_nombre.value = '';
		input_comentario.value = '';
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
	
	formulario.appendChild(label_nombre);
	formulario.appendChild(input_nombre);
	formulario.appendChild(label_comentario);
	formulario.appendChild(input_comentario);
	
	/*------------------------------------------------------------------*/
	
	formulario.appendChild(boton_submit);
	formulario.appendChild(boton_actualizar);

}

async function cargarFilas() {

	tbody.innerHTML = "";

	const data: Proveedor[] = await traerDatos();

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
			input_nombre.value = data.nombre;
			input_comentario.value = data.comentario || '';
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

async function traerDatos(): Promise<Proveedor[]> {
	const proveedores = <Proveedor[]>await (await fetch("http://localhost:3000/proveedores")).json();
	return proveedores;
}

async function agregarEntidad(): Promise<consultaResponse> {
	const response = await fetch('http://localhost:3000/proveedores', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ nombre: input_nombre.value,comentario: input_comentario.value }),
	});

	const result = <consultaResponse>await response.json()
	return result;
}

async function editarEntidad(id: number): Promise<consultaResponse> {
	const response = await fetch(`http://localhost:3000/proveedores/?id=${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ nombre: input_nombre.value,comentario: input_comentario.value }),
	});
	const result = <consultaResponse>await response.json()
	return result;
}

async function eliminarEntidad(id: number): Promise<consultaResponse> {
	const response = await fetch(`http://localhost:3000/proveedores/?id=${id}`, {
		method: 'DELETE',
	});
	const result = <consultaResponse>await response.json()
	console.log(result)
	return result;
}

window.onload = main;