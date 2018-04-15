<?php
/*
*  ====>
*
*  *Login using the authentication system.*
*
*  POST parameters
*    * username    = Username
*    * password    = Password
*    * who         = A string that identifies the caller. For example
*                    the name of the software that's using the API.
*
*  Return value
*    * session = A session data array.
*    * error = An error code or API_E_OK on success.
*
*  <====
*/

require_once($_SERVER['DOCUMENT_ROOT'].'/api/api.php');

$AUTH_LOGIN = new APIEndpoint(array(
	APIEndpoint::METHOD		=> API_METHOD['POST'],
	APIEndpoint::RESPONSE_TYPE	=> API_RESPONSE['JSON'],
	APIEndpoint::FORMAT => array(
		'username' => API_P_STR,
		'password' => API_P_STR,
		'who'      => API_P_STR
	),
	APIEndpoint::REQ_QUOTA		=> FALSE,
	APIEndpoint::REQ_AUTH		=> FALSE
));
api_endpoint_init($AUTH_LOGIN);

$user = auth_creds_verify(
	$AUTH_LOGIN->get('username'),
	$AUTH_LOGIN->get('password')
);

if ($user) {
	// Create a new session.
	$tmp = preg_match('/[^a-zA-Z0-9_-]/', $AUTH_LOGIN->get('who'));
	if ($tmp) {
		throw new APIException(
			API_E_INVALID_REQUEST,
			"Invalid characters in the 'who' parameter."
		);
	} else if ($tmp === NULL) {
		throw new APIException(
			API_E_INTERNAL,
			"preg_match() failed."
		);
	}
	$session = $user->session_new(
		$AUTH_LOGIN->get('who'),
		$_SERVER['REMOTE_ADDR']
	);
	$user->write();

	/*
	*  Set the session cookies. Note that the server setting these
	*  cookies is merely a convenience feature that is useful for
	*  web browser clients that need to access the LibreSignage
	*  web interface too. Other clients can ignore these cookies
	*  if so desired.
	*/
	setcookie(
		$name = 'session_token',
		$value = $session['token'],
		$expire = $session['created'] + $session['max_age'],
		$path = '/'
	);
	setcookie(
		$name = 'session_created',
		$value = $session['created'],
		$expire = $session['created'] + $session['max_age'],
		$path = '/'
	);
	setcookie(
		$name = 'session_max_age',
		$value = $session['max_age'],
		$expire = $session['created'] + $session['max_age'],
		$path = '/'
	);

	$AUTH_LOGIN->resp_set(array(
		'session' => $session,
		'error' => API_E_OK
	));
} else {
	$AUTH_LOGIN->resp_set(array(
		'error' => API_E_INCORRECT_CREDS
	));
}
$AUTH_LOGIN->send();
