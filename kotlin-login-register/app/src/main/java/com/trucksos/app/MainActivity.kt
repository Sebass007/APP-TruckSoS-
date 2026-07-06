package com.trucksos.app

import android.os.Bundle
import android.util.Patterns
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TruckSOSTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0D0D0D)
                ) {
                    AppNavigation()
                }
            }
        }
    }
}

enum class Screen {
    LOGIN, REGISTER, HOME
}

// Icono personalizado de camión dibujado nativamente sobre un lienzo (Canvas)
@Composable
fun TruckIcon(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.size(36.dp, 24.dp)) {
        val orange = Color(0xFFF95A2C)
        // Remolque (Cuerpo de carga)
        drawRoundRect(
            color = orange,
            topLeft = androidx.compose.ui.geometry.Offset(x = 0f, y = size.height * 0.15f),
            size = androidx.compose.ui.geometry.Size(width = size.width * 0.58f, height = size.height * 0.55f),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(4f, 4f)
        )
        // Cabina
        drawRoundRect(
            color = orange,
            topLeft = androidx.compose.ui.geometry.Offset(x = size.width * 0.62f, y = size.height * 0.28f),
            size = androidx.compose.ui.geometry.Size(width = size.width * 0.38f, height = size.height * 0.42f),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(6f, 6f)
        )
        // Parabrisas de la cabina
        drawRect(
            color = Color(0xFF0D0D0D),
            topLeft = androidx.compose.ui.geometry.Offset(x = size.width * 0.78f, y = size.height * 0.35f),
            size = androidx.compose.ui.geometry.Size(width = size.width * 0.16f, height = size.height * 0.18f)
        )
        // Chasis inferior
        drawRect(
            color = orange,
            topLeft = androidx.compose.ui.geometry.Offset(x = size.width * 0.1f, y = size.height * 0.68f),
            size = androidx.compose.ui.geometry.Size(width = size.width * 0.8f, height = size.height * 0.08f)
        )
        // Rueda izquierda (Eje de carga)
        drawCircle(
            color = Color(0xFF0D0D0D),
            radius = size.height * 0.16f,
            center = androidx.compose.ui.geometry.Offset(x = size.width * 0.25f, y = size.height * 0.78f)
        )
        drawCircle(
            color = orange,
            radius = size.height * 0.08f,
            center = androidx.compose.ui.geometry.Offset(x = size.width * 0.25f, y = size.height * 0.78f)
        )
        // Rueda derecha (Eje de dirección)
        drawCircle(
            color = Color(0xFF0D0D0D),
            radius = size.height * 0.16f,
            center = androidx.compose.ui.geometry.Offset(x = size.width * 0.72f, y = size.height * 0.78f)
        )
        drawCircle(
            color = orange,
            radius = size.height * 0.08f,
            center = androidx.compose.ui.geometry.Offset(x = size.width * 0.72f, y = size.height * 0.78f)
        )
    }
}

@Composable
fun AppNavigation() {
    var currentScreen by remember { mutableStateOf(Screen.LOGIN) }
    var loggedInUserEmail by remember { mutableStateOf("") }

    AnimatedVisibility(
        visible = currentScreen == Screen.LOGIN,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        LoginScreen(
            onNavigateToRegister = { currentScreen = Screen.REGISTER },
            onLoginSuccess = { email ->
                loggedInUserEmail = email
                currentScreen = Screen.HOME
            }
        )
    }

    AnimatedVisibility(
        visible = currentScreen == Screen.REGISTER,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        RegisterScreen(
            onNavigateToLogin = { currentScreen = Screen.LOGIN },
            onRegisterSuccess = { email ->
                loggedInUserEmail = email
                currentScreen = Screen.HOME
            }
        )
    }

    AnimatedVisibility(
        visible = currentScreen == Screen.HOME,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        HomeScreen(
            email = loggedInUserEmail,
            onLogout = {
                loggedInUserEmail = ""
                currentScreen = Screen.LOGIN
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: (String) -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0D0D0D))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // LOGO TRUCKSOS CON EL CAMIONCITO NARANJA
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            TruckIcon(modifier = Modifier.size(36.dp, 24.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "TRUCK",
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic
            )
            Text(
                text = "SOS",
                color = Color(0xFFF95A2C),
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic
            )
        }

        // CONTENEDOR TIPO CARD
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF161618)),
            border = BorderStroke(1.dp, Color(0xFF2C2C2E))
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "BIENVENIDO DE VUELTA",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Start
                )
                Text(
                    text = "INGRESA TUS CREDENCIALES PARA CONTINUAR",
                    color = Color(0xFF8E8E93),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp, bottom = 24.dp),
                    textAlign = TextAlign.Start
                )

                // Input Email
                Text(
                    text = "EMAIL CORPORATIVO O PERSONAL",
                    color = Color(0xFF8E8E93),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp),
                    textAlign = TextAlign.Start
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; errorMessage = "" },
                    placeholder = { Text("ejemplo@trucksos.com", color = Color(0xFF48484A)) },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Email", tint = Color(0xFF8E8E93)) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF0F0F10),
                        unfocusedContainerColor = Color(0xFF0F0F10),
                        focusedBorderColor = Color(0xFFF95A2C),
                        unfocusedBorderColor = Color(0xFF2C2C2E),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Input Contraseña
                Text(
                    text = "CONTRASEÑA SEGURA",
                    color = Color(0xFF8E8E93),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp),
                    textAlign = TextAlign.Start
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; errorMessage = "" },
                    placeholder = { Text("••••••••", color = Color(0xFF48484A)) },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Lock", tint = Color(0xFF8E8E93)) },
                    trailingIcon = {
                        val image = if (passwordVisible) Icons.Default.Info else Icons.Default.Lock
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(image, contentDescription = "Toggle password", tint = Color(0xFF8E8E93))
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF0F0F10),
                        unfocusedContainerColor = Color(0xFF0F0F10),
                        focusedBorderColor = Color(0xFFF95A2C),
                        unfocusedBorderColor = Color(0xFF2C2C2E),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                if (errorMessage.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = errorMessage,
                        color = Color.Red,
                        fontSize = 11.sp,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Start
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Botón Iniciar Sesión
                Button(
                    onClick = {
                        if (email.isEmpty() || password.isEmpty()) {
                            errorMessage = "Por favor, completa todos los campos."
                        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                            errorMessage = "Formato de correo electrónico inválido."
                        } else {
                            isLoading = true
                            coroutineScope.launch {
                                delay(2000)
                                isLoading = false
                                onLoginSuccess(email)
                            }
                        }
                    },
                    enabled = !isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFF95A2C),
                        contentColor = Color.White
                    )
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "INICIAR SESIÓN",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = "Next")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Link Registro
                Text(
                    text = "¿NO TIENES UNA CUENTA?",
                    color = Color(0xFF8E8E93),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = onNavigateToRegister) {
                    Text(
                        text = "REGÍSTRATE GRATIS AQUÍ",
                        color = Color(0xFFF95A2C),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic
                    )
                }
            }
        }

        // FOOTER
        Text(
            text = "TRUCKSOS PERÚ © 2026",
            color = Color(0xFF48484A),
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: (String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0D0D0D))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            TruckIcon(modifier = Modifier.size(36.dp, 24.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "REGISTRO",
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                fontStyle = FontStyle.Italic
            )
        }

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF161618)),
            border = BorderStroke(1.dp, Color(0xFF2C2C2E))
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "CREAR UNA CUENTA",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Start
                )
                Text(
                    text = "ÚNETE A LA RED DE AUXILIO MECÁNICO",
                    color = Color(0xFF8E8E93),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp, bottom = 24.dp),
                    textAlign = TextAlign.Start
                )

                // Input Nombre
                Text(
                    text = "NOMBRE COMPLETO",
                    color = Color(0xFF8E8E93),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp),
                    textAlign = TextAlign.Start
                )
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; errorMessage = "" },
                    placeholder = { Text("Juan Pérez", color = Color(0xFF48484A)) },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = "Name", tint = Color(0xFF8E8E93)) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF0F0F10),
                        unfocusedContainerColor = Color(0xFF0F0F10),
                        focusedBorderColor = Color(0xFFF95A2C),
                        unfocusedBorderColor = Color(0xFF2C2C2E),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Input Email
                Text(
                    text = "EMAIL DE CONTACTO",
                    color = Color(0xFF8E8E93),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp),
                    textAlign = TextAlign.Start
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; errorMessage = "" },
                    placeholder = { Text("ejemplo@gmail.com", color = Color(0xFF48484A)) },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Email", tint = Color(0xFF8E8E93)) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF0F0F10),
                        unfocusedContainerColor = Color(0xFF0F0F10),
                        focusedBorderColor = Color(0xFFF95A2C),
                        unfocusedBorderColor = Color(0xFF2C2C2E),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Input Password
                Text(
                    text = "CONTRASEÑA SEGURA",
                    color = Color(0xFF8E8E93),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp),
                    textAlign = TextAlign.Start
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; errorMessage = "" },
                    placeholder = { Text("Mínimo 6 caracteres", color = Color(0xFF48484A)) },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Lock", tint = Color(0xFF8E8E93)) },
                    trailingIcon = {
                        val image = if (passwordVisible) Icons.Default.Info else Icons.Default.Lock
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(image, contentDescription = "Toggle password", tint = Color(0xFF8E8E93))
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF0F0F10),
                        unfocusedContainerColor = Color(0xFF0F0F10),
                        focusedBorderColor = Color(0xFFF95A2C),
                        unfocusedBorderColor = Color(0xFF2C2C2E),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                if (errorMessage.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = errorMessage,
                        color = Color.Red,
                        fontSize = 11.sp,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Start
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                            errorMessage = "Por favor, completa todos los campos."
                        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                            errorMessage = "Formato de correo electrónico inválido."
                        } else if (password.length < 6) {
                            errorMessage = "La contraseña debe tener al menos 6 caracteres."
                        } else {
                            isLoading = true
                            coroutineScope.launch {
                                delay(2000)
                                isLoading = false
                                onRegisterSuccess(email)
                            }
                        }
                    },
                    enabled = !isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFF95A2C),
                        contentColor = Color.White
                    )
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "REGISTRARSE AHORA",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = "Register")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                TextButton(onClick = onNavigateToLogin) {
                    Text(
                        text = "¿Ya tienes cuenta? Inicia sesión",
                        color = Color(0xFFF95A2C),
                        fontSize = 11.sp
                    )
                }
            }
        }

        Text(
            text = "TRUCKSOS PERÚ © 2026",
            color = Color(0xFF48484A),
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
    }
}

@Composable
fun HomeScreen(
    email: String,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0D0D0D))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.CheckCircle,
            contentDescription = "Success",
            tint = Color(0xFF10B981),
            modifier = Modifier.size(96.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "¡INGRESO EXITOSO!",
            fontSize = 24.sp,
            fontWeight = FontWeight.Black,
            fontStyle = FontStyle.Italic,
            color = Color.White
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Bienvenido a la red TruckSOS:",
            fontSize = 14.sp,
            color = Color(0xFF8E8E93)
        )

        Text(
            text = email,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black,
            fontStyle = FontStyle.Italic,
            color = Color(0xFFF95A2C),
            modifier = Modifier.padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFE03A3E),
                contentColor = Color.White
            )
        ) {
            Text(
                text = "CERRAR SESIÓN NATIVO",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun TruckSOSTheme(content: @Composable () -> Unit) {
    val darkColors = darkColorScheme(
        primary = Color(0xFFF95A2C),
        background = Color(0xFF0D0D0D),
        surface = Color(0xFF161618)
    )
    MaterialTheme(
        colorScheme = darkColors,
        content = content
    )
}
