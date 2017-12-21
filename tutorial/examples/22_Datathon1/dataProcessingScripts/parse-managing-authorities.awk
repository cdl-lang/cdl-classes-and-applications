BEGIN {
    matching_line = 0;
    print "[";
    country_code["Austria"] = "AT";
    country_code["Belgium"] = "BE";
    country_code["Bulgaria"] = "BG";
    country_code["Cyprus"] = "CY";
    country_code["Czech Republic"] = "CZ";
    country_code["Germany"] = "DE";
    country_code["Denmark"] = "DK";
    country_code["Estonia"] = "EE";
    country_code["Greece"] = "GR"; // EL in other lists
    country_code["Spain"] = "ES";
    country_code["Finland"] = "FI";
    country_code["France"] = "FR";
    country_code["Croatia"] = "HR";
    country_code["Hungary"] = "HU";
    country_code["Ireland"] = "IE";
    country_code["Italy"] = "IT";
    country_code["Lithuania"] = "LT";
    country_code["Luxembourg"] = "LU";
    country_code["Latvia"] = "LV";
    country_code["Malta"] = "MT";
    country_code["Netherlands"] = "NL";
    country_code["Poland"] = "PL";
    country_code["Portugal"] = "PT";
    country_code["Romania"] = "RO";
    country_code["Sweden"] = "SE";
    country_code["Slovenia"] = "SI";
    country_code["Slovakia"] = "SK";
    country_code["United Kingdom"] = "UK";
}

function stringify(str) {
    return gensub(/["\\]/, "\\$1", "g", str);
}

/<h3>.*<\/h3>/ {
    country = gensub(/[^>]*>/, "", 1);
    country = gensub(/<.*/, "", 1, country);
}

/<a href=.*> Web <\/a>/ {
    url = gensub(/.*<a href="/, "", 1);
    url = gensub(/".*/, "", 1, url);
    matching_line = NR + 6;
}

NR == matching_line {
    name = gensub(/[^>]*>/, "", 1);
    name = gensub(/<.*/, "", 1, name);
    print "{name:\"" stringify(name) "\",url:\"" stringify(url) "\",country:\"" country_code[country] "\"},";
    matching_line = 0;
}

END {
    print "]";
}
