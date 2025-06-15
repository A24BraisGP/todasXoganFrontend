import React, { useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { FaGamepad } from 'react-icons/fa6';
import { FaAccessibleIcon } from 'react-icons/fa6';
import { FaRegStar } from 'react-icons/fa6';
import { FaBars } from 'react-icons/fa6';
import { FaCircleXmark } from 'react-icons/fa6';
import { FaRegNoteSticky } from 'react-icons/fa6';

interface SidebarProps {
	tab: string;
	onClick: (tab: string) => void;
	isLoggedIn: boolean;
}

const Sidebar = ({ tab, onClick, isLoggedIn }: SidebarProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const tabs = [
		{ id: 'inicio', label: 'Inicio', icon: <FaHome /> },
		{ id: 'catalogo', label: 'Catálogo', icon: <FaGamepad /> },
		{
			id: 'accesibilidade',
			label: 'Accesibilidade',
			icon: <FaAccessibleIcon />,
		},
	];

	if (isLoggedIn) {
		tabs.push(
			{ id: 'perfil', label: 'Favoritos', icon: <FaRegStar /> },
			{ id: 'propostas', label: 'Propostas', icon: <FaRegNoteSticky /> }
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
				{isOpen ? <FaCircleXmark /> : <FaBars />}
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
