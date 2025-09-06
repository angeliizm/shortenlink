package security

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/argon2"
)

type PasswordConfig struct {
	Time    uint32
	Memory  uint32
	Threads uint8
	KeyLen  uint32
	SaltLen uint32
}

var DefaultPasswordConfig = &PasswordConfig{
	Time:    1,
	Memory:  64 * 1024, // 64 MB
	Threads: 4,
	KeyLen:  32,
	SaltLen: 16,
}

// HashPassword hashes a password using Argon2id
func HashPassword(password string, config *PasswordConfig) (string, error) {
	if config == nil {
		config = DefaultPasswordConfig
	}

	salt := make([]byte, config.SaltLen)
	_, err := rand.Read(salt)
	if err != nil {
		return "", fmt.Errorf("failed to generate salt: %w", err)
	}

	hash := argon2.IDKey([]byte(password), salt, config.Time, config.Memory, config.Threads, config.KeyLen)

	// Encode the salt and hash to base64
	saltEncoded := base64.StdEncoding.EncodeToString(salt)
	hashEncoded := base64.StdEncoding.EncodeToString(hash)

	// Format: $argon2id$v=19$m=65536,t=1,p=4$salt$hash
	return fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		config.Memory, config.Time, config.Threads, saltEncoded, hashEncoded), nil
}

// VerifyPassword verifies a password against its hash
func VerifyPassword(password, hashedPassword string) (bool, error) {
	salt, hash, config, err := parseHash(hashedPassword)
	if err != nil {
		return false, err
	}

	computedHash := argon2.IDKey([]byte(password), salt, config.Time, config.Memory, config.Threads, config.KeyLen)

	return subtle.ConstantTimeCompare(hash, computedHash) == 1, nil
}

func parseHash(hashedPassword string) ([]byte, []byte, *PasswordConfig, error) {
	var version int
	var memory, time uint32
	var threads uint8
	var saltEncoded, hashEncoded string

	_, err := fmt.Sscanf(hashedPassword, "$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		&version, &memory, &time, &threads, &saltEncoded, &hashEncoded)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("invalid hash format: %w", err)
	}

	if version != 19 {
		return nil, nil, nil, fmt.Errorf("unsupported Argon2 version: %d", version)
	}

	salt, err := base64.StdEncoding.DecodeString(saltEncoded)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to decode salt: %w", err)
	}

	hash, err := base64.StdEncoding.DecodeString(hashEncoded)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to decode hash: %w", err)
	}

	config := &PasswordConfig{
		Time:    time,
		Memory:  memory,
		Threads: threads,
		KeyLen:  uint32(len(hash)),
		SaltLen: uint32(len(salt)),
	}

	return salt, hash, config, nil
}