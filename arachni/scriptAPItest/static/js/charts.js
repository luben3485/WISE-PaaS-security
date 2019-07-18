function index_to_shortname( index ){
    return ["xss_script_context","xss","common_directories","common_admin_interfaces","common_files","x_frame_options","insecure_cross_domain_policy_access","interesting_responses","html_objects"][index];
}

function index_to_severity( index ){
    return {"xss_script_context":"high","xss":"high","common_directories":"medium","common_admin_interfaces":"low","common_files":"low","x_frame_options":"low","insecure_cross_domain_policy_access":"low","interesting_responses":"informational","html_objects":"informational"}[index_to_shortname(index)];
}

function renderCharts() {
    if( window.renderedCharts )
    window.renderedCharts = true;

    c3.generate({
        bindto: '#chart-issues',
        data: {
            columns: [
                ["Trusted",1,1,1,1,4,1,1,1,1],
                ["Untrusted",0,0,0,0,0,0,0,0,0],
                ["Severity",4,4,3,2,2,2,2,1,1]
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
        regions: [{"class":"severity-high","start":0,"end":1},{"class":"severity-medium","start":2,"end":2},{"class":"severity-low","start":3,"end":6},{"class":"severity-informational","start":7}],
        axis: {
            x: {
                type: 'category',
                categories: ["Cross-Site Scripting (XSS) in script context","Cross-Site Scripting (XSS)","Common directory","Common administration interface","Common sensitive file","Missing 'X-Frame-Options' header","Insecure cross-domain policy (allow-access-from)","Interesting response","HTML object"],
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
            columns: [["Trusted",12],["Untrusted",0]]
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
            columns: [["form",2],["body",1],["server",9]]
        }
    });

    c3.generate({
        bindto: '#chart-severities',
        data: {
            type: 'pie',
            columns: [["high",2],["medium",1],["low",7],["informational",2]]
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
