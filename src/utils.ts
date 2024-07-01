import axios from "axios";

export function assert(statement: boolean, message?: string) {
    if (!statement) {
        throw new Error(message || "Undefined Error");
    }
}
export async function checkUserProfile(id: any, token: string) {
        const {data: userResponse} =  await axios.get(
            'https://api.matrica.io/oauth2/user/profile',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
        );
        assert(userResponse.id === id);
}