import { useState, useEffect } from 'react';
import { z } from 'zod';
import axios from 'axios';
import Alert from '../../login/components/Alert';

// Esquema de validación para propostas
const propostaSchema = z.object({
	titulo: z
		.string()
		.min(1, { message: 'O título é obrigatorio.' })
		.max(100, { message: 'O título é demasiado longo.' }),
	descricion: z
		.string()
		.min(1, { message: 'A descrición é obrigatoria.' })
		.max(1000, { message: 'A descrición é demasiado longa.' }),
	prezo: z
		.string()
		.min(1, { message: 'O prezo é obrigatorio.' })
		.refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
			message: 'O prezo debe de ser un número positivo.',
		}),
	idade_recomendada: z
		.number()
		.refine((val) => [3, 6, 9, 12, 16, 18].includes(val), {
			message:
				'A idade recomendada debe de ser unha das opcións dispoñibles.',
		}),
	caratula: z.any().optional(),
	alt: z
		.string()
		.max(250, { message: 'A descrición alternativa é demasiado longa.' })
		.optional(),
	xeneros: z
		.array(z.number())
		.min(1, { message: 'Debes seleccionar polo menos un xénero.' }),
	plataformas: z
		.array(z.number())
		.min(1, { message: 'Debes seleccionar polo menos unha plataforma.' }),
	accesibilidades: z.array(z.number()).optional(),
	usuario_id: z.number(),
	desarrolladora: z
		.string()
		.min(1, { message: 'A desarrolladora é obligatoria.' })
		.max(100, {
			message: 'O nome da desarrolladora é demasiado longo.',
		}),
});

type PropostaSchemaType = z.infer<typeof propostaSchema>;
type PropostaSchemaKey = keyof PropostaSchemaType;

interface Xenero {
	id: number;
	xenero: string;
}

interface Plataforma {
	id: number;
	plataforma: string;
}

interface Accesibilidade {
	id: number;
	nome_accesibilidade: string;
}

interface FormData {
	titulo: string;
	descricion: string;
	prezo: string;
	idade_recomendada: number;
	caratula: File | null;
	alt: string;
	xeneros: number[];
	plataformas: number[];
	accesibilidades: number[];
	desarrolladora: string;
	usuario_id: number;
}

// Constantes para las opciones de edad
const AGE_OPTIONS = [
	{ value: 3, label: '3+' },
	{ value: 6, label: '6+' },
	{ value: 9, label: '9+' },
	{ value: 12, label: '12+' },
	{ value: 16, label: '16+' },
	{ value: 18, label: '18+' },
] as const;

const PropostaForm = () => {
	const [formData, setFormData] = useState<FormData>({
		titulo: '',
		descricion: '',
		prezo: '',
		idade_recomendada: 3,
		caratula: null,
		alt: '',
		xeneros: [],
		plataformas: [],
		accesibilidades: [],
		desarrolladora: '',
		usuario_id: 0,
	});
	const [xeneros, setXeneros] = useState<Xenero[]>([]);
	const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
	const [accesibilidades, setAccesibilidades] = useState<Accesibilidade[]>(
		[]
	);
	const [error, setError] = useState<string>('');
	const [success, setSuccess] = useState<string>('');
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [xenerosRes, plataformasRes, accesibilidadesRes] =
					await Promise.all([
						axios.get('/api/xeneros/'),
						axios.get('/api/plataformas/'),
						axios.get('/api/accesibilidades/'),
					]);

				setXeneros(xenerosRes.data);
				setPlataformas(plataformasRes.data);
				setAccesibilidades(accesibilidadesRes.data);
			} catch (error) {
				console.error('Error fetching data:', error);
				setError('Error ao cargar os datos necesarios');
			}
		};
		fetchData();
	}, []);

	const validateField = (name: PropostaSchemaKey, value: any) => {
		try {
			const fieldSchema = propostaSchema.shape[name];
			if (fieldSchema) {
				fieldSchema.parse(value);
				setValidationErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors[name];
					return newErrors;
				});
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				setValidationErrors((prev) => ({
					...prev,
					[name]: error.errors[0].message,
				}));
			}
		}
	};

	const cleanInput = (input: string) => {
		return input.replace(/(<([^>]+)>)/gi, '');
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | { name?: string; value: unknown }
		>
	) => {
		const { name, value } = e.target;
		if (name) {
			let processedValue = value;
			if (name === 'idade_recomendada') {
				processedValue = Number(value);
			}
			setFormData((prev) => ({
				...prev,
				[name]: processedValue || '',
			}));
			validateField(name as PropostaSchemaKey, processedValue || '');
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFormData((prev) => ({
				...prev,
				caratula: e.target.files![0],
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				caratula: null,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setValidationErrors({});

		try {
			propostaSchema.parse({
				...formData,
				usuario_id: parseInt(localStorage.getItem('userId') || '0'),
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: { [key: string]: string } = {};
				error.errors.forEach((err) => {
					if (err.path[0]) {
						errors[err.path[0].toString()] = err.message;
					}
				});
				setValidationErrors(errors);
				return;
			}
		}

		try {
			const formDataToSend = new FormData();

			// Añadir todos los campos al FormData con los nombres exactos del modelo
			formDataToSend.append('titulo', formData.titulo);
			formDataToSend.append(
				'descricion',
				cleanInput(formData.descricion)
			);
			formDataToSend.append('prezo', formData.prezo);
			formDataToSend.append(
				'idade_recomendada',
				formData.idade_recomendada.toString()
			);
			formDataToSend.append('desarrolladora', formData.desarrolladora);
			formDataToSend.append(
				'usuario_id',
				localStorage.getItem('userId') || ''
			);
			formDataToSend.append('alt', formData.alt || '');

			// Añadir los arrays de IDs directamente
			formData.xeneros.forEach((id) => {
				formDataToSend.append('xenero', id.toString());
			});

			formData.plataformas.forEach((id) => {
				formDataToSend.append('plataforma', id.toString());
			});

			formData.accesibilidades.forEach((id) => {
				formDataToSend.append('accesibilidades', id.toString());
			});

			// Añadir la imagen si existe
			if (formData.caratula) {
				formDataToSend.append('caratula', formData.caratula);
			}

			// Log de los datos que se van a enviar
			console.log('Datos a enviar:', {
				titulo: formData.titulo,
				descricion: formData.descricion,
				prezo: formData.prezo,
				idade_recomendada: formData.idade_recomendada,
				desarrolladora: formData.desarrolladora,
				usuario_id: localStorage.getItem('userId'),
				alt: formData.alt,
				xenero: formData.xeneros,
				plataforma: formData.plataformas,
				accesibilidades: formData.accesibilidades,
				tieneImagen: !!formData.caratula,
			});

			const response = await axios.post(
				'/api/propostas/',
				formDataToSend,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${localStorage.getItem(
							'token'
						)}`,
					},
					withCredentials: true,
				}
			);

			if (response.status === 201) {
				setSuccess('Proposta enviada con éxito');
				setFormData({
					titulo: '',
					descricion: '',
					prezo: '',
					idade_recomendada: 3,
					caratula: null,
					alt: '',
					xeneros: [],
					plataformas: [],
					accesibilidades: [],
					desarrolladora: '',
					usuario_id: 0,
				});
			}
		} catch (error) {
			console.error('Error completo:', error);
			if (axios.isAxiosError(error)) {
				console.error('Datos del error:', {
					status: error.response?.status,
					data: error.response?.data,
					headers: error.response?.headers,
				});
				setError(
					error.response?.data?.detail ||
						error.response?.data?.error ||
						'Error al enviar la propuesta'
				);
			} else {
				setError('Error al enviar la propuesta');
			}
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-100 py-8">
			<div className="card w-full max-w-2xl bg-base-200 shadow-xl">
				<div className="card-body p-8">
					<h2 className="card-title text-2xl font-bold text-center mb-8">
						Propor Novo Xogo
					</h2>
					{error && (
						<Alert onClose={() => setError('')}>{error}</Alert>
					)}
					{success && (
						<Alert onClose={() => setSuccess('')}>{success}</Alert>
					)}
					{Object.entries(validationErrors).map(
						([field, message]) => (
							<Alert
								key={field}
								onClose={() => {
									setValidationErrors((prev) => {
										const newErrors = { ...prev };
										delete newErrors[field];
										return newErrors;
									});
								}}
							>
								{message}
							</Alert>
						)
					)}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Título
								</span>
							</label>
							<input
								type="text"
								name="titulo"
								placeholder="Titulo"
								value={formData.titulo}
								onChange={handleChange}
								className={`input input-bordered w-full ${
									validationErrors.titulo ? 'input-error' : ''
								}`}
								required
							/>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Desarrolladora
								</span>
							</label>
							<input
								type="text"
								name="desarrolladora"
								placeholder="Desarrolladora"
								value={formData.desarrolladora}
								onChange={handleChange}
								className={`input input-bordered w-full ${
									validationErrors.desarrolladora
										? 'input-error'
										: ''
								}`}
								required
							/>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Descrición
								</span>
							</label>
							<textarea
								name="descricion"
								placeholder="Descrición"
								value={formData.descricion}
								onChange={handleChange}
								className={`textarea textarea-bordered h-32 ${
									validationErrors.descricion
										? 'textarea-error'
										: ''
								}`}
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-6">
							<div className="form-control">
								<label className="label">
									<span className="label-text font-semibold mx-4">
										Prezo
									</span>
								</label>
								<input
									type="number"
									name="prezo"
									value={formData.prezo}
									onChange={handleChange}
									className={`input input-bordered w-full ${
										validationErrors.prezo
											? 'input-error'
											: ''
									}`}
									step="0.01"
									min="0"
									required
								/>
							</div>

							<div className="form-control">
								<label className="label">
									<span className="label-text font-semibold mx-4">
										Idade Recomendada
									</span>
								</label>
								<select
									name="idade_recomendada"
									value={formData.idade_recomendada}
									onChange={handleChange}
									className={`select select-bordered w-full ${
										validationErrors.idade_recomendada
											? 'select-error'
											: ''
									}`}
									required
								>
									{AGE_OPTIONS.map(({ value, label }) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Xéneros
								</span>
							</label>
							<div className="bg-base-100 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
								{xeneros.map((xenero) => (
									<label
										key={xenero.id}
										className="flex items-center space-x-2 cursor-pointer"
									>
										<input
											type="checkbox"
											className="checkbox checkbox-primary"
											checked={formData.xeneros.includes(
												xenero.id
											)}
											onChange={(e) => {
												const newXeneros = e.target
													.checked
													? [
															...formData.xeneros,
															xenero.id,
													  ]
													: formData.xeneros.filter(
															(id) =>
																id !== xenero.id
													  );
												setFormData((prev) => ({
													...prev,
													xeneros: newXeneros,
												}));
												validateField(
													'xeneros',
													newXeneros
												);
											}}
										/>
										<span>{xenero.xenero}</span>
									</label>
								))}
							</div>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Plataformas
								</span>
							</label>
							<div className="bg-base-100 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
								{plataformas.map((plataforma) => (
									<label
										key={plataforma.id}
										className="flex items-center space-x-2 cursor-pointer"
									>
										<input
											type="checkbox"
											className="checkbox checkbox-primary"
											checked={formData.plataformas.includes(
												plataforma.id
											)}
											onChange={(e) => {
												const newPlataformas = e.target
													.checked
													? [
															...formData.plataformas,
															plataforma.id,
													  ]
													: formData.plataformas.filter(
															(id) =>
																id !==
																plataforma.id
													  );
												setFormData((prev) => ({
													...prev,
													plataformas: newPlataformas,
												}));
												validateField(
													'plataformas',
													newPlataformas
												);
											}}
										/>
										<span>{plataforma.plataforma}</span>
									</label>
								))}
							</div>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Accesibilidades
								</span>
							</label>
							<div className="bg-base-100 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
								{accesibilidades.map((accesibilidade) => (
									<label
										key={accesibilidade.id}
										className="flex items-center space-x-2 cursor-pointer"
									>
										<input
											type="checkbox"
											className="checkbox checkbox-primary"
											checked={formData.accesibilidades.includes(
												accesibilidade.id
											)}
											onChange={(e) => {
												const newAccesibilidades = e
													.target.checked
													? [
															...formData.accesibilidades,
															accesibilidade.id,
													  ]
													: formData.accesibilidades.filter(
															(id) =>
																id !==
																accesibilidade.id
													  );
												setFormData((prev) => ({
													...prev,
													accesibilidades:
														newAccesibilidades,
												}));
											}}
										/>
										<span>
											{accesibilidade.nome_accesibilidade}
										</span>
									</label>
								))}
							</div>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Carátula
								</span>
							</label>
							<input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								className="file-input file-input-bordered w-full"
							/>
							{formData.caratula && (
								<p className="text-sm mt-2">
									Archivo seleccionado:{' '}
									{formData.caratula.name}
								</p>
							)}
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold mx-4">
									Descripción alternativa de la carátula
								</span>
							</label>
							<input
								type="text"
								name="alt"
								value={formData.alt}
								onChange={handleChange}
								className={`input input-bordered w-full ${
									validationErrors.alt ? 'input-error' : ''
								}`}
								placeholder="Describe la imagen para usuarios con discapacidad visual"
							/>
							<label className="label">
								<span className="label-text-alt">
									Texto alternativo para a imaxe
								</span>
							</label>
						</div>

						<div className="form-control mt-8">
							<button
								type="submit"
								className="btn btn-primary w-full"
							>
								Enviar Proposta
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default PropostaForm;
