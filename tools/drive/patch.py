#!/usr/bin/env python3
"""Add Drive mode (v130) to an Old Ground page (v129+). Usage: python3 -I patch.py <page.html> [out.html]
Appends drive.css before <div class="app">, drive.js (with the no-sleep video inlined) as its own script after the last </script>,
and a Drive mode section in Field skills. Refuses to double-patch."""
import sys, os, base64
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
here = os.path.dirname(os.path.abspath(__file__))
s = open(src, encoding='utf-8').read()
if 'window.drvStart=' in s: sys.exit('already patched')
css = open(os.path.join(here, 'drive.css'), encoding='utf-8').read()
js = open(os.path.join(here, 'drive.js'), encoding='utf-8').read()
vid = base64.b64encode(open(os.path.join(here, 'nosleep.mp4'), 'rb').read()).decode()
js = js.replace('@@NOSLEEP@@', vid)
a = s.index('<div class="app">')
s = s[:a] + '<style>\n' + css + '</style>\n' + s[a:]
i = s.rindex('</script>') + len('</script>')
s = s[:i] + '\n<script>\n' + js + '</script>' + s[i:]
toc = '<a class="chip small" href="#k-legend">'
assert s.count(toc) == 1
s = s.replace(toc, '<a class="chip small" href="#k-drive">Drive mode</a>' + toc)
sec = '''<h2 id="k-drive">Drive mode</h2>
        <p>For a phone on a dash mount. Open it from the <b>+</b> button or <b>More &gt; Drive mode</b>. The map tilts and turns so the road ahead points up, the screen stays on, and the dark panel shows the ranked spots ahead of you (Best, Good and Some old ground, from the layers you have on) with distance, which side of the road, and the main reason. <b>Navigate</b> hands the spot to Google Maps or Apple Maps for turn-by-turn directions.</p>
        <ul>
          <li><b>Set it up before you roll.</b> Pick your layers, Google or Apple Maps, and voice on or off while parked. Don't tap through cards while driving: let a passenger do it, or pull over. Voice reads out a spot once when it is within 3 miles ahead.</li>
          <li><b>Mount the phone</b> low where it doesn't block the road, and keep it plugged in. GPS and a lit screen drain a battery fast. After 10 minutes parked, the screen is allowed to sleep; tap it to keep driving.</li>
          <li><b>A spot ahead is not permission.</b> Most pins sit on private land or public land with rules. Read the card's access notes and ask before you detect.</li>
          <li><b>No CarPlay.</b> Apple only lets approved native apps onto the car screen, so Old Ground can't show there. Navigate opens Google Maps or Apple Maps, which do show on CarPlay, with the spot as the destination.</li>
          <li>Drag the map to look around; <b>Re-center</b> picks you back up. With no signal, the cards and GPS still work, and the map shows the areas you saved offline.</li>
        </ul>

        '''
h = '<h2 id="k-legend">'
assert s.count(h) == 1
s = s.replace(h, sec + h)
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
