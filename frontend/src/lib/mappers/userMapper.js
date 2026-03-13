`src/lib/mappers/userMapper.js`

export function mapApiUser(rawUser) {
	if (!rawUser || typeof rawUser !== 'object') {
		throw new Error('Invalid user payload');
	}

	return {
		id: typeof rawUser.id === 'string' ? rawUser.id : '',
		email: typeof rawUser.email === 'string' ? rawUser.email : '',
		name: typeof rawUser.name === 'string' ? rawUser.name : '',
		createdAt: rawUser.createdAt ?? null,
		updatedAt: rawUser.updatedAt ?? null,
	};
}

export function extractApiUser(payload) {
	const candidate = payload?.data?.user ?? payload?.data ?? null;

	if (!candidate || typeof candidate !== 'object') {
		throw new Error('User not found in API payload');
	}

	return mapApiUser(candidate);
}