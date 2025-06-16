import './index.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from './components/xeral/components/Nav';
import Sidebar from './components/xeral/components/Sidebar';
import Catalogo from './components/catalogo/components/Catalogo';
import Footer from './components/xeral/components/Footer';
import Login from './components/login/components/Login';
import XogoDetalle from './components/detalles/components/XogoDetalle';
import Favoritos from './components/favoritos/components/Favoritos';
import PropostaForm from './components/propostas/components/PropostaForm';
import PropostasEnviadas from './components/propostas/components/PropostasEnviadas';
import Accesibilidade from './components/Accesibilidade';

// Configuración global de axios
axios.defaults.baseURL = 'https://restapitodasxogan.onrender.com';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';

interface Xogo {
	id: number;
	titulo: string;
	accesibilidades: Array<number>;
	descricion: string;
	prezo: number;
	idade_recomendada: number;
	xenero: Array<number>;
	plataforma: Array<number>;
	caratula: string;
	desarrolladora: string;
}

interface Xenero {
	id: number;
	xenero: string;
}

interface Plataforma {
	id: number;
	plataforma: string;
}

interface AccesibilidadeType {
	id: number;
	nome_accesibilidade: string;
	descricion: string;
}

interface Usuario {
	id: number;
	nome: string;
	email: string;
	favoritos: number[];
	admin: boolean;
	imaxe_user: string | null;
}

interface Comentario {
	id: number;
	comentario: string;
	usuario: number;
	videoxogo: number;
}

function App() {
	const [tab, setTab] = useState<string>('inicio');
	const [showLogin, setShowLogin] = useState(false);
	const [userId, setUserId] = useState<number>(0);
	const [users, setUsers] = useState<Usuario[]>([]);
	const [selectedGame, setSelectedGame] = useState<number | null>(null);
	const [xogos, setXogos] = useState<Xogo[]>([]);
	const [xeneros, setXeneros] = useState<Xenero[]>([]);
	const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
	const [accesibilidades, setAccesibilidades] = useState<
		AccesibilidadeType[]
	>([]);
	const [comentarios, setComentarios] = useState<Comentario[]>([]);
	console.log('showLogin -> ' + showLogin);
	console.log('comentarios -> ' + comentarios);
	// Atallos de teclado
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.altKey && !event.shiftKey) {
				event.preventDefault();

				const keyPressed = event.key.toLowerCase();

				switch (keyPressed) {
					case '1':
						setTab('inicio');
						break;
					case '2':
						setTab('catalogo');
						break;
					case '3':
						setTab('accesibilidade');
						break;
					case '4':
						if (userId != 0) {
							setTab('perfil');
						}
						break;
					case '5':
						if (!userId) {
							handleLoginClick();
						}
						break;
					case '6':
						if (userId != 0) {
							setTab('propostas');
						}
						break;
					default:
						break;
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [userId]);

	useEffect(() => {
		// Petición para obtelos videoxogos
		axios
			.get('/api/videoxogos/')
			.then((response) => setXogos(response.data))
			.catch((error) => console.error('Error:', error));

		// Petición para obtener xéneros
		axios
			.get('/api/xeneros/')
			.then((response) => setXeneros(response.data))
			.catch((error) => console.error('Error ao cargar xéneros:', error));

		// Petición para obtener plataformas
		axios
			.get('/api/plataformas/')
			.then((response) => setPlataformas(response.data))
			.catch((error) =>
				console.error('Error ao cargar plataformas:', error)
			);

		// Petición para obtener accesibilidades
		axios
			.get('/api/accesibilidades/')
			.then((response) => setAccesibilidades(response.data))
			.catch((error) =>
				console.error('Error ao cargar accesibilidades:', error)
			);
		// Petición para obter os comentarios
		axios
			.get('/api/comentarios/')
			.then((response) => setComentarios(response.data))
			.catch((error) =>
				console.error('Erro ao cargar os comentarios : ', error)
			);

		// Comproba usuario
		const savedUserId = localStorage.getItem('userId');

		if (savedUserId) {
			const userId = parseInt(savedUserId);
			setUserId(userId);
			// Petición sobre o usuario específico se xa existe no local storage
			axios
				.get(`/api/usuarios/${userId}/`)
				.then((response) => {
					setUsers([response.data]);
				})
				.catch((error) => {
					console.error('Erro usuario:', error);
					localStorage.removeItem('userId');
					setUserId(0);
					setUsers([]);
				});
		}
	}, []);

	const checkUser = (usuario: Usuario) => {
		localStorage.setItem('userId', usuario.id.toString());
		setUserId(usuario.id);
		setUsers([usuario]);
		setShowLogin(false);
		setTab('inicio');
	};

	const handleLoginClick = () => {
		setShowLogin(true);
		setTab('login');
	};

	const handleVerDetalles = (id: number) => {
		setSelectedGame(id);
		setTab('detalles');
	};

	const handleLogout = () => {
		setUserId(0);
		setUsers([]);
		localStorage.removeItem('userId');
		localStorage.removeItem('token');
		localStorage.removeItem('refreshToken');
		setTab('inicio');
	};

	const handleAccesibilidadClick = () => {
		setTab('accesibilidade');
	};

	const handleToggleFavorito = async (xogoId: number) => {
		if (!userId) return;

		const user = users.find((u) => u.id === userId);
		if (!user) return;

		const isFavorito = user.favoritos.includes(xogoId);

		try {
			if (isFavorito) {
				await axios.delete(
					`/api/favoritos/delete/?usuario=${userId}&videoxogo=${xogoId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								'token'
							)}`,
						},
					}
				);
			} else {
				await axios.post(
					'/api/favoritos/',
					{
						usuario: userId,
						videoxogo: xogoId,
					},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								'token'
							)}`,
						},
						withCredentials: true,
					}
				);
			}

			const newFavoritos = isFavorito
				? user.favoritos.filter((id) => id !== xogoId)
				: [...user.favoritos, xogoId];

			setUsers((prevUsers) =>
				prevUsers.map((u) =>
					u.id === userId ? { ...u, favoritos: newFavoritos } : u
				)
			);
		} catch (error) {
			console.error('Erro favoritos:', error);
		}
	};

	const renderContent = () => {
		// Comproba se o usuario é admin, un atributo booleano
		const isAdmin = users.find((u) => u.id === userId)?.admin;

		switch (tab) {
			case 'inicio':
				return (
					<div className="hero bg-base-200 h-screen">
						<div className="hero-content flex-col lg:flex-row p-4 h-full">
							<div className="max-w-md flex flex-col justify-center">
								<h1 className="text-4xl lg:text-5xl font-bold">
									Benvida{' '}
									{userId !== 0
										? users[0]?.nome
										: 'a todas Xogan!'}
								</h1>
								<p className="py-4">
									Damosche á benvida ao teu catálogo de
									videoxogos accesibles!
								</p>
								<button
									onClick={() => setTab('catalogo')}
									className="btn btn-primary w-fit"
								>
									Ver catálogo
								</button>
								<h2 className="text-xl lg:text-2xl font-bold mt-8 mb-2">
									Xogos destacados
								</h2>
								<div className="logos group relative overflow-hidden whitespace-nowrap py-2 [mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]">
									<div className="animate-slide-left-infinite group-hover:animation-pause inline-block w-max">
										{xogos.slice(0, 6).map((xogo) => (
											<div
												key={xogo.id}
												className="mx-2 inline-block"
											>
												<div className="card w-36 lg:w-48 bg-base-100 shadow-xl">
													<figure>
														<img
															src={xogo.caratula}
															alt={`Carátula de ${xogo.titulo}`}
															className="h-24 lg:h-32 w-full object-cover"
														/>
													</figure>
													<div className="card-body p-2 lg:p-4">
														<h3 className="card-title text-xs lg:text-sm">
															{xogo.titulo}
														</h3>
													</div>
												</div>
											</div>
										))}
									</div>
									<div className="animate-slide-left-infinite group-hover:animation-pause inline-block w-max">
										{xogos.slice(0, 6).map((xogo) => (
											<div
												key={`duplicate-${xogo.id}`}
												className="mx-2 inline-block"
											>
												<div className="card w-36 lg:w-48 bg-base-100 shadow-xl">
													<figure>
														<img
															src={xogo.caratula}
															alt={`Carátula de ${xogo.titulo}`}
															className="h-24 lg:h-32 w-full object-cover"
														/>
													</figure>
													<div className="card-body p-2 lg:p-4">
														<h3 className="card-title text-xs lg:text-sm">
															{xogo.titulo}
														</h3>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			case 'catalogo':
				return (
					<div className="flex flex-col items-center w-full p-4">
						<Catalogo
							xogos={xogos}
							xeneros={xeneros}
							plataformas={plataformas}
							accesibilidades={accesibilidades}
							onVerDetalles={handleVerDetalles}
							onToggleFavorito={handleToggleFavorito}
							favoritos={users[0]?.favoritos || []}
							userId={userId}
						/>
					</div>
				);
			case 'perfil':
				return (
					<div className="flex flex-col items-center w-full p-4">
						<Favoritos
							xogos={xogos}
							favoritos={
								users.find((u) => u.id === userId)?.favoritos ||
								[]
							}
							onVerDetalles={handleVerDetalles}
							onToggleFavorito={handleToggleFavorito}
							userName={users.find((u) => u.id === userId)?.nome}
							accesibilidades={accesibilidades}
							userId={userId}
						/>
					</div>
				);
			case 'propostas':
				return (
					<div className="flex flex-col items-center w-full p-4">
						{isAdmin ? <PropostasEnviadas /> : <PropostaForm />}
					</div>
				);
			case 'login':
				return (
					<div className="flex items-center justify-center min-h-screen">
						<Login onLogin={checkUser} />
					</div>
				);
			case 'detalles':
				return (
					<div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
						<div className="flex flex-col items-center w-full">
							<div className="w-full max-w-3xl">
								<XogoDetalle
									xogoId={selectedGame!}
									onVolver={() => setTab('catalogo')}
									userId={userId}
								/>
							</div>
						</div>
						<div className="w-full max-w-xs mx-auto lg:mx-0"></div>
					</div>
				);
			case 'accesibilidade':
				return (
					<div className="flex flex-col items-center w-full p-4">
						<Accesibilidade accesibilidades={accesibilidades} />
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-base-100">
			<Nav
				onLoginClick={handleLoginClick}
				isLoggedIn={!!userId}
				userName={users.find((u) => u.id === userId)?.nome}
				userImage={
					users.find((u) => u.id === userId)?.imaxe_user || undefined
				}
				onHomeClick={() => setTab('inicio')}
				onLogout={handleLogout}
				onAccesibilidadClick={handleAccesibilidadClick}
			/>
			<div className="flex-1 flex min-h-0">
				<Sidebar tab={tab} onClick={setTab} isLoggedIn={!!userId} />
				<main className="flex-1 flex justify-center items-start py-8 px-4">
					<div className="w-full max-w-5xl">{renderContent()}</div>
				</main>
			</div>
			<Footer />
		</div>
	);
}

export default App;
