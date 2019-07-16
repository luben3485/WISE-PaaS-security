function index_to_shortname( index ){
    return ["sql_injection","xss_script_context","xss","common_directories","common_admin_interfaces","common_files","x_frame_options","insecure_cross_domain_policy_access","html_objects","interesting_responses"][index];
}

function index_to_severity( index ){
    return {"sql_injection":"high","xss_script_context":"high","xss":"high","common_directories":"medium","common_admin_interfaces":"low","common_files":"low","x_frame_options":"low","insecure_cross_domain_policy_access":"low","html_objects":"informational","interesting_responses":"informational"}[index_to_shortname(index)];
}

function renderCharts() {
    if( window.renderedCharts )
    window.renderedCharts = true;

    c3.generate({
        bindto: '#chart-issues',
        data: {
            columns: [
                ["Trusted",1,1,1,1,1,4,1,1,6,2],
                ["Untrusted",0,0,0,0,0,0,0,0,0,0],
                ["Severity",4,4,4,3,2,2,2,2,1,1]
            ],
            axes: {
                Severity: 'y2'
            },
            type: 'bar',
            groups: [
                ['Trusted', 'Untrusted']
            ],
            types: {
                Severity: 'line'
            },
            onclick: function (d) {
                var location;

                if( d.name.toLowerCase() == 'severity' ) {
                    location = 'summary/issues/trusted/severity/' + index_to_severity(d.x);
                } else {
                    location = 'summary/issues/' + d.name.toLowerCase() + '/severity/' +
                        index_to_severity(d.x) + '/' + index_to_shortname(d.x);
                }

                goToLocation( location );
            }
        },
        regions: [{"class":"severity-high","start":0,"end":2},{"class":"severity-medium","start":3,"end":3},{"class":"severity-low","start":4,"end":7},{"class":"severity-informational","start":8}],
        axis: {
            x: {
                type: 'category',
                categories: ["SQL Injection","Cross-Site Scripting (XSS) in script context","Cross-Site Scripting (XSS)","Common directory","Common administration interface","Common sensitive file","Missing 'X-Frame-Options' header","Insecure cross-domain policy (allow-access-from)","HTML object","Interesting response"],
                tick: {
                    rotate: 15
                }
            },
            y: {
                label: {
                    text: 'Amount of logged issues',
                    position: 'outer-center'
                }
            },
            y2: {
                label: {
                    text: 'Severity',
                    position: 'outer-center'
                },
                show: true,
                type: 'category',
                categories: [1, 2, 3, 4],
                tick: {
                    format: function (d) {
                        return ["Informational","Low","Medium","High"][d - 1]
                    }
                }
            }
        },
        padding: {
            bottom: 40
        },
        color: {
            pattern: [ '#1f77b4', '#d62728', '#ff7f0e' ]
        }
    });

    c3.generate({
        bindto: '#chart-trust',
        data: {
            type: 'pie',
            columns: [["Trusted",19],["Untrusted",0]]
        },
        pie: {
            onclick: function (d) { goToLocation( 'summary/issues/' + d.id.toLowerCase() ) }
        },
        color: {
            pattern: [ '#1f77b4', '#d62728' ]
        }
    });

    c3.generate({
        bindto: '#chart-elements',
        data: {
            type: 'pie',
            columns: [["form",3],["body",6],["server",10]]
        }
    });

    c3.generate({
        bindto: '#chart-severities',
        data: {
            type: 'pie',
            columns: [["high",3],["medium",1],["low",7],["informational",8]]
        },
        color: {
            pattern: [ '#d62728', '#ff7f0e', '#ffbb78', '#1f77b4' ]
        },
        pie: {
            onclick: function (d) {
                goToLocation( 'summary/issues/trusted/severity/' + d.id );
            }
        }
    });

}
