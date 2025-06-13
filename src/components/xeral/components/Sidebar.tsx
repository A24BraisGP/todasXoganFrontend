import React, { useState } from 'react';

interface SidebarProps {
	tab: string;
	onClick: (tab: string) => void;
	isLoggedIn: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ tab, onClick, isLoggedIn }) => {
	const [isOpen, setIsOpen] = useState(false);

	const tabs = [
		{ id: 'inicio', label: 'Inicio', icon: '🏠' },
		{ id: 'catalogo', label: 'Catálogo', icon: '🎮' },
		{ id: 'accesibilidade', label: 'Accesibilidade', icon: '♿' },
	];

	if (isLoggedIn) {
		tabs.push(
			{ id: 'perfil', label: 'Perfil', icon: '👤' },
			{ id: 'propostas', label: 'Propostas', icon: '📝' }
		);
	}

	const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick(tabId);
		}
	};

	return (
		<>
			<button
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-base-200 rounded-lg"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Toggle menu"
			>
				{isOpen ? '✕' : '☰'}
			</button>
			<aside
				className={`fixed lg:static w-64 min-h-full bg-base-200 text-base-content p-4 transform transition-transform duration-300 ease-in-out ${
					isOpen
						? 'translate-x-0'
						: '-translate-x-full lg:translate-x-0'
				} z-40`}
				role="navigation"
				aria-label="Menú principal"
			>
				<ul className="menu" role="menubar">
					{tabs.map((t) => (
						<li key={t.id} role="none">
							<a
								role="menuitem"
								tabIndex={0}
								className={`flex items-center gap-2 ${
									tab === t.id ? 'active' : ''
								}`}
								onClick={() => {
									onClick(t.id);
									setIsOpen(false);
								}}
								onKeyDown={(e) => handleKeyDown(e, t.id)}
								aria-current={tab === t.id ? 'page' : undefined}
							>
								<span className="text-xl" aria-hidden="true">
									{t.icon}
								</span>
								{t.label}
							</a>
						</li>
					))}
				</ul>
			</aside>
		</>
	);
};

export default Sidebar;
