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
	accesibilidades: Array<{
		id: number;
		nome_accesibilidade: string;
	}>;
	descricion: string;
	prezo: number;
	idade_recomendada: number;
	xenero: Array<number>;
	plataforma: Array<number>;
	caratula: string;
	desarrolladora: string;
}

interface AccesibilidadeType {
	id: number;
	nome_accesibilidade: string;
}

interface Xenero {
	id: number;
	nome_xenero: string;
}
interface Comentario {
	id: number;
	comentario: string;
	likes: number;
	dislikes: number;
	usuario: number;
	videoxogo: number;
}
interface Plataforma {
	id: number;
	nome_plataforma: string;
}

interface Usuario {
	id: number;
	favoritos: number[];
	preferencias: Array<AccesibilidadeType>;
	nome: string;
	email: string;
	imaxe_user: string | null;
	admin: boolean;
}

function App() {
	const [tab, setTab] = useState<string>('inicio');
	const [xogos, setXogos] = useState<Xogo[]>([]);
	const [users, setUsers] = useState<Usuario[]>([]);
	const [userId, setUserId] = useState(0);
	const [showLogin, setShowLogin] = useState(false);
	const [selectedGame, setSelectedGame] = useState<number | null>(null);
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
			if (event.ctrlKey && event.key.toLowerCase() === 'j') {
				event.preventDefault();
				setTab('accesibilidade');
			} else if (event.ctrlKey && event.key.toLowerCase() === 'h') {
				event.preventDefault();
				setTab('inicio');
			} else if (event.ctrlKey && event.key.toLowerCase() === 'c') {
				event.preventDefault();
				setTab('catalogo');
			} else if (
				event.ctrlKey &&
				event.key.toLowerCase() === 'a' &&
				!userId
			) {
				event.preventDefault();
				setTab('perfil');
			} else if (
				event.ctrlKey &&
				event.key.toLowerCase() === 'ñ' &&
				!userId
			) {
				event.preventDefault();
				handleLoginClick();
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
		console.log('ID de usuario guardado:', savedUserId);

		if (savedUserId) {
			const userId = parseInt(savedUserId);
			console.log('ID de usuario parseado:', userId);
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
					<div className="flex flex-col items-center justify-center min-h-screen p-4">
						<h1 className="text-4xl font-bold mb-4">
							Benvida a TodasXogan
						</h1>
						{/* TODO poñer intro en orde */}
						<p className="text-xl text-center max-w-2xl"></p>
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
