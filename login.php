<?php
/**
 * @package img.pew.cc
 * @author Daniel Triendl <daniel@pew.cc>
 * @version $Id$
 * @license http://opensource.org/licenses/agpl-v3.html
 */

/**
 * img.pew.cc Image Hosting
 * Copyright (C) 2009-2010  Daniel Triendl <daniel@pew.cc>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>. 
 */

require_once('lib/config.php');
require_once('lib/functions.php');
require_once('lib/openid/class.openid.php');

if (isset($_GET['action']) && $_GET['action'] == 'logout') {
	$_SESSION['openid_identity'] = '';
	session_destroy();
	errorMsg('You have been logged out.');
}

$oid = new OpenID();

if (isset($_POST['openid_identifier'])) {
	$oid->SetIdentifier($_POST['openid_identifier']);
	try {
		$oid->DiscoverEndpoint();
	} catch (OpenIDException $e) {
		// If we fail to discover an endpoint, exit
		errorMsg('OpenID endpoint not found.');
	}
	$oid->SetReturnTo(url() . 'login.php');
	$oid->SetRealm(url());
	$oid->RedirectUser();
	die();
}

if ($oid->IsResponse()) {
	try {
		$mode = $oid->GetResponseMode();
		if ($mode == 'id_res') {
			if($oid->VerifyAssertion()) {
				$_SESSION['openid_identity'] = $oid->GetIdentifier();
				errorMsg('Login successful.<br />You are now logged in as <i>' . $oid->GetIdentifier() . '</i>', url());
			} else {
				session_destroy();
				errorMsg('Login failed.', url());
			}
		} else {
			session_destroy();
			errorMsg('Login failed: ' . $mode, url());
		}
	} catch (OpenIDException $e) {
		session_destroy();
		errorMsg('Login failed:' . $e->getMessage(), url());
	}
}

if (!empty($_SESSION['openid_identity'])) {
	outputHTML('You are logged in as <i>' . $_SESSION['openid_identity'] . '</i><br /><br /><a href="login.php?action=logout">Logout</a>');
} else {
	$output = '<h2>OpenID Login</h2>
<form action="login.php" method="post">
<div id="login">
	<input type="text" name="openid_identifier" size="30" id="inputopenid_identifier" />
	<input type="submit" name="openid_submit" value="Login" id="inputopenid_submit" />
	<br />&nbsp;
</div>
</form>
';
	outputHTML($output, array('title' => 'Login'));
}

?>