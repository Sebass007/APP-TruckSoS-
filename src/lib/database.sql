-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'proveedor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Proveedores (Perfil extendido para mecánicos/llanteros)
CREATE TABLE proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_negocio TEXT,
    especialidades TEXT[], -- Array de especialidades (llantas, motor, etc.)
    latitud FLOAT,
    longitud FLOAT,
    calificacion_promedio FLOAT DEFAULT 0,
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Solicitudes de Servicio
CREATE TABLE solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    proveedor_id UUID REFERENCES usuarios(id), -- Puede ser NULL hasta que se acepte
    tipo_servicio TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'en_camino', 'completada', 'cancelada')),
    latitud FLOAT NOT NULL, -- Ubicación de la emergencia
    longitud FLOAT NOT NULL,
    monto_pactado DECIMAL(10,2), -- Para la negociación tipo InDrive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Calificaciones y Reseñas
CREATE TABLE calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    proveedor_id UUID NOT NULL REFERENCES usuarios(id),
    estrellas INT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Mensajes (Chat de Negociación)
CREATE TABLE mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    emisor_id UUID NOT NULL REFERENCES usuarios(id),
    contenido TEXT NOT NULL,
    es_oferta BOOLEAN DEFAULT FALSE,
    monto_oferta DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para mensajes
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver mensajes de sus solicitudes" ON mensajes
FOR SELECT USING (
    auth.uid() IN (
        SELECT cliente_id FROM solicitudes WHERE id = solicitud_id
        UNION
        SELECT proveedor_id FROM solicitudes WHERE id = solicitud_id
    )
);

CREATE POLICY "Usuarios pueden enviar mensajes a sus solicitudes" ON mensajes
FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT cliente_id FROM solicitudes WHERE id = solicitud_id
        UNION
        SELECT proveedor_id FROM solicitudes WHERE id = solicitud_id
    )
);

-- Habilitar Row Level Security (RLS) en Supabase por seguridad básica
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA LA TABLA USUARIOS
CREATE POLICY "Permitir inserción a usuarios nuevos" ON usuarios 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios son visibles para todos" ON usuarios 
FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden actualizar su propia data" ON usuarios 
FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS PARA LA TABLA PROVEEDORES
CREATE POLICY "Permitir inserción de perfil proveedor" ON proveedores
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Proveedores visibles para todos" ON proveedores 
FOR SELECT USING (true);

CREATE POLICY "Proveedores pueden editar su perfil" ON proveedores
FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS PARA LA TABLA SOLICITUDES
CREATE POLICY "Clientes pueden crear solicitudes" ON solicitudes
FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Usuarios pueden ver sus propias solicitudes" ON solicitudes
FOR SELECT USING (
    auth.uid() = cliente_id OR 
    auth.uid() = proveedor_id OR 
    estado = 'pendiente'
);

CREATE POLICY "Usuarios pueden actualizar sus solicitudes" ON solicitudes
FOR UPDATE USING (
    auth.uid() = cliente_id OR 
    auth.uid() = proveedor_id
);
