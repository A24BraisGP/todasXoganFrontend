import { useState } from 'react';
import Like from './Like';

function Comment() {
	// o useState debería ser o valor recollido do Comentario
	// TODO Implementar comentarios -> usuario rexistrado pode facer comentarios. Lista cos comentarios
	const [liked, setLiked] = useState(false);
	return (
		<>
			<Like liked={liked} onClick={() => setLiked(!liked)}></Like>
		</>
	);
}
export default Comment;
