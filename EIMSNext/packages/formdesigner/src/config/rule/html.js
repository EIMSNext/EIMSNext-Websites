import {localeProps} from '../../utils';

const label = 'HTML';
const name = 'html';

export default {
    menu: 'aide',
    icon: 'icon-html',
    label,
    name,
    sfc(rule){
        rule.type = 'div';
    },
    rule() {
        return {
            type: name,
            title: '',
            style: {
                display: 'block',
                width: '100%',
            },
            children: ['<div style="color:#2E73FF;display:flex;align-items:center;"><img style="width:20px;height:20px;display:inline-block;"src="https://static.form-create.com/example.png"data="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGaADAAQAAAABAAAAGQAAAABY85deAAABuElEQVQ4Ee2UTYtBYRTH595BIu8hoYSNfAFJVrKxsFA+gg9laycLG7KQHUo+gRAhRaHI+8v8ZOYu7jTNTM1iauZZnOc8/+c8/3PP/5yu0G63n35oiT/Ec6f55/qemL9VL8VkMimVSo9iUqlUuVze7Xay2mw222w2A4zFYl6v93ELUiwW8YPBoNForNfrCqfTSUS1Wk0mkxaLRalUxuNxu92ey+XC4bDb7a7Van6/fzQardfrbrcrcS0WC4PBQEAoFBIE4XA4KCA2m81YvV6PjUQiEOE8lkqlikajxN1uN2yr1TqdTuTj9nK54Oh0OlG8iw6JXHuXy/VK87ZpNBqTycSJHGq1ejgc4q9WKz7qLeR1F7PZbD6fl6EfHSmw3+9zi8rvs4qZTCadTn/0WIb7fD6EOx6PlCy74iiv8X2EhFyvV6vVqtVqm82mw+GQcMm5c223WywSSCgIGi+XSwQGPJ/P4/G41+vhUOZ8Pqfj+/2e6aG55CBms9k8JxKJx3x1Oh2Px4PS0+m0UCgQgUMC6qpUKoPBgIHiZSAQoH0Iz9CQD5D+gjcaDeH/Xyh14yvON2biU7q/wPUCZDXIe9hWJkQAAAAASUVORK5CYII="/><span style="font-size:16px;">HTMLHTMLHTMLHTMLHTMLHTMLHTMLHTMLHTMLHTMLHTML</span></div>'],
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'HtmlEditor',
                field: 'formCreateChild',
            }
        ]);
    }
};
