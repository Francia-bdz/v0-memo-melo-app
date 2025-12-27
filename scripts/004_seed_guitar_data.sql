-- Seed data for Guitar instrument and its elements

-- Insert Guitar instrument
insert into public.instruments (id, name, created_at)
values ('00000000-0000-0000-0000-000000000001', 'Guitare', now())
on conflict (id) do nothing;

-- Insert mandatory elements for Guitar
insert into public.instrument_elements (instrument_id, name, description, is_mandatory, order_index)
values 
  ('00000000-0000-0000-0000-000000000001', 'Rythme / Tempo', 'Capacité à jouer la musique en rythme, avec un tempo stable du début à la fin.', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'Accords / Notes', 'Capacité à jouer les bons accords ou les bonnes notes sans erreurs majeures.', true, 2),
  ('00000000-0000-0000-0000-000000000001', 'Structure', 'Capacité à enchaîner correctement les différentes parties du morceau (couplets, refrains, etc.).', true, 3)
on conflict do nothing;

-- Insert optional elements for Guitar
insert into public.instrument_elements (instrument_id, name, description, is_mandatory, order_index)
values 
  ('00000000-0000-0000-0000-000000000001', 'Techniques spécifiques', 'Maîtrise des techniques propres au morceau (arpèges, palm mute, hammer-on, etc.).', false, 4),
  ('00000000-0000-0000-0000-000000000001', 'Nuances / Expression', 'Capacité à faire varier l''intensité et l''expression musicale.', false, 5),
  ('00000000-0000-0000-0000-000000000001', 'Son', 'Qualité et cohérence du son (attaque, propreté, réglages).', false, 6)
on conflict do nothing;
