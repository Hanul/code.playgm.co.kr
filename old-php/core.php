<?php
	function make_random_string($length) {
		$chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		$charcount = strlen($chars);
		$result = "";

		for ($i = 0; $i < $length; $i++) {
			$index = mt_rand(0, $charcount - 1);
			$result .= $chars[$index];
		}

		return $result;
	}
	
	function new_hash() {
		do {
			$randomed_hash = make_random_string(7);
		} while (file_exists("codes/".$randomed_hash.".txt"));
			
		return $randomed_hash;
	}

	function expected_key($hash) {
		return sha1("jDcSckY91E".$hash."ZNqSSryKzj");
	}

	if (isset($_REQUEST["hash"])) {
		$stripped_hash = preg_replace("/[^a-zA-Z0-9]/", "", $_REQUEST["hash"]);
		$filepath = "codes/".$stripped_hash.".txt";

		if (isset($_REQUEST["key"])) {
			if ($_REQUEST["key"] === expected_key($_REQUEST["hash"])) {
				echo json_encode(array("success" => true));
			} else {
				$stripped_hash = new_hash();
				echo json_encode(array("success" => true, "hash" => $stripped_hash, "key" => expected_key($stripped_hash)));
			}

			$filepath = "codes/".$stripped_hash.".txt";
			
			if (isset($_REQUEST["contents"])) {
				$trimed_contents = mb_strimwidth($_REQUEST["contents"], 0, 8192);
				file_put_contents($filepath, $trimed_contents);
			}
			
			return;
		} else {
			if (file_exists($filepath)) {
				echo json_encode(array("success" => true, "contents" => file_get_contents($filepath)));
				return;
			}
		}
		
		echo json_encode(array("success" => false));
		return;
	} else {
		$files = scandir("codes");

		foreach ($files as $filename) {
			if (!in_array($filename, array(".", "..", ".htaccess"))) {
				$hashpath = "codes/".$filename;
				$remaintime = (3600 * 24 * 7) - time() + filemtime($hashpath);

				if ($remaintime <= 0) {
					$rmfiles = scandir("codes");

					foreach ($rmfiles as $rmfile) {
						if (!in_array($rmfile, array(".", "..")))
							unlink($hashpath);
					}

					continue;
				}
			}
		}

		$new_hash = new_hash();
		echo json_encode(array("success" => true, "hash" => $new_hash, "key" => expected_key($new_hash)));
	}
?>
