interface NavProps {
	onLoginClick: () => void;
	isLoggedIn: boolean;
	userName?: string;
	userImage?: string;
	onHomeClick: () => void;
	onLogout: () => void;
	onAccesibilidadClick: () => void;
}

const Nav = ({
	onLoginClick,
	isLoggedIn,
	userName,
	userImage,
	onHomeClick,
	onLogout,
	onAccesibilidadClick,
}: NavProps) => {
	const getInitials = (name: string) => {
		return name
			.split('')
			.map((word) => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const getAvatarUrl = () => {
		if (userImage) {
			return userImage;
		}
		if (userName) {
			return getInitials(userName);
		}
		return '';
	};

	return (
		<nav className="navbar bg-base-100 shadow-lg">
			<div className="navbar-start">
				<a
					className="btn btn-ghost normal-case text-xl"
					onClick={onHomeClick}
				>
					TodasXogan
				</a>
			</div>

			<div className="navbar-end gap-2">
				<div className="dropdown dropdown-end">
					<label tabIndex={0} className="btn btn-ghost btn-circle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					</label>
					<ul
						tabIndex={0}
						className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
					>
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								className="theme-controller btn btn-ghost btn-sm btn-block justify-start"
								aria-label="Default"
								value="default"
							/>
						</li>
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								className="theme-controller btn btn-ghost btn-sm btn-block justify-start"
								aria-label="Light"
								value="light"
							/>
						</li>
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								className="theme-controller btn btn-ghost btn-sm btn-block justify-start"
								aria-label="Dark"
								value="dark"
							/>
						</li>
					</ul>
				</div>
				{isLoggedIn ? (
					<div className="dropdown dropdown-end">
						<label
							tabIndex={0}
							className="btn btn-ghost btn-circle avatar"
						>
							<div className="w-10 rounded-full">
								<img
									src={getAvatarUrl()}
									alt={userName || 'Usuario'}
									className="w-full h-full object-cover"
								/>
							</div>
						</label>
						<ul
							tabIndex={0}
							className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
						>
							<li>
								<a onClick={onAccesibilidadClick}>
									Accesibilidade
								</a>
							</li>
							<li>
								<a onClick={onLogout}>Pechar sesión</a>
							</li>
						</ul>
					</div>
				) : (
					<button className="btn btn-primary" onClick={onLoginClick}>
						Iniciar Sesión
					</button>
				)}
			</div>
		</nav>
	);
};

export default Nav;
