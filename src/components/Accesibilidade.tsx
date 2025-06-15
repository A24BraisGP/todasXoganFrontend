import { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { FaBrain } from 'react-icons/fa6';
import { FaHandsAslInterpreting } from 'react-icons/fa6';
import { FaUniversalAccess } from 'react-icons/fa';
import { FaEarDeaf } from 'react-icons/fa6';

interface Accesibilidade {
	id: number;
	nome_accesibilidade: string;
	descricion: string;
}

interface AccesibilidadeProps {
	accesibilidades: Accesibilidade[];
}

const Accesibilidade = ({ accesibilidades }: AccesibilidadeProps) => {
	const [activeOptions, setActiveOptions] = useState<{
		[key: string]: boolean;
	}>({
		highContrast: false,
		largeText: false,
		reducedMotion: false,
		dyslexia: false,
		darkMode: false,
	});
	// TODO implementar + opcións (ARIA)
	const toggleOption = (option: string) => {
		setActiveOptions((prev) => {
			const newState = { ...prev, [option]: !prev[option] };

			if (option === 'highContrast') {
				document.documentElement.setAttribute(
					'data-theme',
					newState[option] ? 'high-contrast' : 'light'
				);
			} else if (option === 'largeText') {
				document.documentElement.classList.toggle('large-text');
			} else if (option === 'reducedMotion') {
				document.documentElement.classList.toggle('reduced-motion');
			} else if (option === 'dyslexia') {
				document.documentElement.classList.toggle('dyslexia-friendly');
			} else if (option === 'darkMode') {
				document.documentElement.setAttribute(
					'data-theme',
					newState[option] ? 'dark' : 'light'
				);
			}

			return newState;
		});
	};

	const activatePreset = (preset: string) => {
		Object.keys(activeOptions).forEach((option) => {
			if (activeOptions[option]) {
				toggleOption(option);
			}
		});

		switch (preset) {
			case 'visual':
				toggleOption('highContrast');
				toggleOption('largeText');
				break;
			case 'cognitiva':
				toggleOption('dyslexia');
				toggleOption('reducedMotion');
				break;
			case 'motora':
				toggleOption('largeText');
				toggleOption('reducedMotion');
				break;
			case 'auditiva':
				toggleOption('reducedMotion');
				break;
			case 'sensorial':
				toggleOption('darkMode');
				toggleOption('reducedMotion');
				break;
		}
	};

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-8 text-center">
					Opcións de Accesibilidade
				</h1>

				<div className="mb-8">
					<h2 className="text-2xl font-bold mb-4">
						Perfiles de Accesibilidade
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						<button
							className="btn btn-lg btn-primary p-8"
							onClick={() => activatePreset('visual')}
						>
							<div className="flex flex-col items-center">
								<FaEye />
								<span>Visual</span>
							</div>
						</button>
						<button
							className="btn btn-lg btn-primary p-8"
							onClick={() => activatePreset('cognitiva')}
						>
							<div className="flex flex-col items-center">
								<FaBrain />
								<span>Cognitiva</span>
							</div>
						</button>
						<button
							className="btn btn-lg btn-primary p-8"
							onClick={() => activatePreset('motora')}
						>
							<div className="flex flex-col items-center">
								<FaHandsAslInterpreting />
								<span>Motora</span>
							</div>
						</button>
						<button
							className="btn btn-lg btn-primary p-8"
							onClick={() => activatePreset('auditiva')}
						>
							<div className="flex flex-col items-center">
								<FaEarDeaf />
								<span>Auditiva</span>
							</div>
						</button>
						<button
							className="btn btn-lg btn-primary p-8"
							onClick={() => activatePreset('sensorial')}
						>
							<div className="flex flex-col items-center">
								<FaUniversalAccess />
								<span>Sensorial</span>
							</div>
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="card bg-base-200 shadow-xl">
						<div className="card-body">
							<h2 className="card-title text-xl mb-4">
								Axustes Visuais
							</h2>

							<div className="space-y-4">
								<button
									className={`btn btn-block ${
										activeOptions.highContrast
											? 'btn-primary'
											: 'btn-outline'
									}`}
									onClick={() => toggleOption('highContrast')}
								>
									Alto Contraste
								</button>

								<button
									className={`btn btn-block ${
										activeOptions.largeText
											? 'btn-primary'
											: 'btn-outline'
									}`}
									onClick={() => toggleOption('largeText')}
								>
									Texto Grande
								</button>
							</div>
						</div>
					</div>

					<div className="card bg-base-200 shadow-xl">
						<div className="card-body">
							<h2 className="card-title text-xl mb-4">
								Axustes de Leitura
							</h2>

							<div className="space-y-4">
								<button
									className={`btn btn-block ${
										activeOptions.dyslexia
											? 'btn-primary'
											: 'btn-outline'
									}`}
									onClick={() => toggleOption('dyslexia')}
								>
									Fonte para Dislexia
								</button>

								<button
									className={`btn btn-block ${
										activeOptions.reducedMotion
											? 'btn-primary'
											: 'btn-outline'
									}`}
									onClick={() =>
										toggleOption('reducedMotion')
									}
								>
									Reducir Animacións
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-8">
					<h2 className="text-2xl font-bold mb-4">
						Accesibilidades Dispoñibles
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{accesibilidades.map((acc) => (
							<div
								key={acc.id}
								className="card bg-base-200 shadow-xl"
							>
								<div className="card-body">
									<h3 className="card-title">
										{acc.nome_accesibilidade}
									</h3>
									<p className="text-sm">{acc.descricion}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Accesibilidade;
