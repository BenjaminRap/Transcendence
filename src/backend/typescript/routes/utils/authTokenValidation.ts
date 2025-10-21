/*
    Partie locale
    Jusqu’à 64 caractères,
    pouvant être des lettres, des chiffres et/ou de certains caractères spéciaux.

    Les caractères spéciaux acceptés dans la partie locale sont les suivants :

    ! # $ % & ‘ * + – / = ? ^ _ ` . { | } ~

    Sachez que le « . » en tant que tel peut être accepté, à condition qu’il ne soit ni placé en premier,
    ni placé en dernier. Aussi, il ne peut être répété de manière consécutive.
    Le tiret non plus n’est pas accepté en tout début et en toute fin de la partie locale.


    Jusqu’à 255 caractères
    Attention, le nom de domaine ne peut contenir plus de 64 caractères
    (lettres, chiffres et/ou trait d’union).

    Les lettres peuvent être en majuscules ou en minuscules.

    Le trait d’union ne peut être placé ni en premier caractère, ni en dernier caractère.

    Voici quelques exemples de syntaxes correctes :

    premierepartie@captain.verify.com
    premierepartie2@captain-verify.com
    premiere.partie33@captainverify.com
    Voici quelques exemples de syntaxes incorrectes :

    premierepartie.@captainverify.com
    premiere partie2@-captainverify-.com
    premiere..partie3@captainverify.com
*/
export function validateEmail(email: string) : boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password: string) : boolean {

    if (password.length < 8) {
        return false;
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return false;
    }
    if (!/(?=.*\d)/.test(password)) {
        return false;
    }
    
    return true;
}

export function validateUserame(username: string) : boolean {
    if (username.length > 20)
        return false;
    return true;
} 

export function validateRegisterData( username: string, email: string, password: string ) : { success: boolean; message: string}
{
    if (!username || !email || !password)
    {
        return {
            success: false,
            message: 'All fields are required'
        };
    }

    if ( !validateUserame(username) )
    {
        return {
            success: false,
            message: 'Username can\'t exceed 20 characters'
        };
    }
    
    if (!validateEmail(email)) {
        return {
            success: false,
            message: 'Invalid email format'
        };
    }

    if ( !validatePassword(password) )
    {
        return {
            success: false,
            message: 'Password must contain at least:\n8 characters\none lowercase letter\none capital letter\none number'
        };
    }

    return {
        success: true,
        message: ''
    };
}
