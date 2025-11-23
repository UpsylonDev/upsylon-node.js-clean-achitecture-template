import { DataSource } from 'typeorm';
import { Environment } from '../../config/environment';
import { PinoLogger } from '../../logging/PinoLogger';
import { UserEntity } from './entities/UserEntity';

/**
 * Manages the TypeORM connection.
 * Singleton to ensure a single active connection.
 */
export class TypeOrmConnection {
    private static instance: TypeOrmConnection;
    private dataSource: DataSource;
    private isConnected: boolean = false;
    private logger = new PinoLogger({ context: 'TypeOrmConnection' });

    private constructor() {
        this.dataSource = new DataSource({
            type: 'postgres',
            host: Environment.POSTGRES_HOST,
            port: Environment.POSTGRES_PORT,
            username: Environment.POSTGRES_USER,
            password: Environment.POSTGRES_PASSWORD,
            database: Environment.POSTGRES_DB,
            synchronize: true, // Auto-create tables (dev only, disable in prod)
            logging: Environment.isDevelopment(),
            entities: [UserEntity],
            subscribers: [],
            migrations: [],
        });
    }

    public static getInstance(): TypeOrmConnection {
        if (!TypeOrmConnection.instance) {
            TypeOrmConnection.instance = new TypeOrmConnection();
        }
        return TypeOrmConnection.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            this.logger.info('Database already connected');
            return;
        }

        try {
            await this.dataSource.initialize();
            this.isConnected = true;
            this.logger.info('Database connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw new Error('Database connection failed');
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.dataSource.destroy();
            this.isConnected = false;
            this.logger.info('Database connection closed');
        } catch (error) {
            this.logger.error('Error closing database connection', error);
            throw error;
        }
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }
}
